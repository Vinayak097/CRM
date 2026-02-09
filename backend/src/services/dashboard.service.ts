import Lead from "../models/Lead.js";
import PropertyProject from "../models/project.model.js";
import { PropertyModel } from "../models/property.model.js";
import User from "../models/User.js";
import { Role } from "../models/User.js";
import mongoose from "mongoose";

// Helper to normalize legacy roles
function normalizeRole(role: string): string {
  if (role === "developer") return "onboarding_agent";
  return role;
}

// Sales Agent Dashboard Stats
export async function getSalesAgentStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  const [assignedLeads, convertedThisMonth, statusCountsAggregation] = await Promise.all([
    Lead.countDocuments({ "system.assignedAgent": userId }),
    Lead.countDocuments({
      "system.assignedAgent": userId,
      "system.leadStatus": "Converted",
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
    }),
    Lead.aggregate([
      { $match: { "system.assignedAgent": new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$system.leadStatus", count: { $sum: 1 } } },
    ]),
  ]);

  // Transform aggregation result to Record<string, number>
  const statusCounts = statusCountsAggregation.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item._id || "New"] = item.count;
      return acc;
    },
    {}
  );

  // Active deals = leads in active stages
  const activeStatuses = ["Contacted", "Qualified", "Shortlisted", "Site Visit", "Negotiation", "Booked"];
  const activeDeals = activeStatuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);

  return {
    role: "sales_agent",
    stats: {
      todaysFollowups: 0, // No followup field yet
      missedFollowups: 0, // No followup field yet
      assignedLeadsCount: assignedLeads,
      monthlyConversions: convertedThisMonth,
      activeDeals,
      pipeline: statusCounts,
    },
  };
}

// Onboarding Agent Dashboard Stats
export async function getOnboardingAgentStats(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [projectsCount, propertiesCount, projectsThisMonth, propertiesThisMonth] = await Promise.all([
    PropertyProject.countDocuments({}),
    PropertyModel.countDocuments({}),
    PropertyProject.countDocuments({ created_at: { $gte: startOfMonth } }),
    PropertyModel.countDocuments({ created_at: { $gte: startOfMonth } }),
  ]);

  // Get projects by status
  const projectsByStatus = await PropertyProject.aggregate([
    { $group: { _id: "$project_status", count: { $sum: 1 } } },
  ]);

  const statusMap = projectsByStatus.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item._id || "Unknown"] = item.count;
      return acc;
    },
    {}
  );

  const completedProjects = statusMap["Completed"] || 0 + (statusMap["Ready to Move"] || 0);
  const totalProjects = projectsCount || 1;
  const completionRate = Math.round((completedProjects / totalProjects) * 100);

  return {
    role: "onboarding_agent",
    stats: {
      projectsCreated: projectsCount,
      propertiesAdded: propertiesCount,
      projectsThisMonth,
      propertiesThisMonth,
      pendingApprovals: 0, // No approval workflow yet
      onboardingProgress: completionRate,
      projectsByStatus: statusMap,
    },
  };
}

// Sales Manager Dashboard Stats
// Sales Manager Dashboard Stats
export async function getSalesManagerStats(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // 1. Fetch managed agents with lead counts using aggregation
  const salesAgents = await User.aggregate([
    {
      $match: {
        role: { $in: ["sales_agent", Role.SalesAgent] },
        managedBy: new mongoose.Types.ObjectId(userId),
      }
    },
    {
      $lookup: {
        from: "leads",
        let: { agentId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$system.assignedAgent", "$$agentId"] } } },
          { $count: "count" }
        ],
        as: "leadCount"
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        assignedLeadsCount: { $ifNull: [{ $arrayElemAt: ["$leadCount.count", 0] }, 0] }
      }
    }
  ]);

  const managedAgentIds = salesAgents.map((agent) => agent._id);

  // 2. Fetch stats filtered by managed agents
  const [totalLeads, convertedThisMonth, statusCountsAggregation] = await Promise.all([
    Lead.countDocuments({ "system.assignedAgent": { $in: managedAgentIds } }),
    Lead.countDocuments({
      "system.leadStatus": "Converted",
      updatedAt: { $gte: startOfMonth },
      "system.assignedAgent": { $in: managedAgentIds },
    }),
    Lead.aggregate([
      { $match: { "system.assignedAgent": { $in: managedAgentIds.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: "$system.leadStatus", count: { $sum: 1 } } },
    ]),
  ]);

  // Transform aggregation result
  const statusCounts = statusCountsAggregation.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item._id || "New"] = item.count;
      return acc;
    },
    {}
  );

  const activeStatuses = [
    "Contacted",
    "Qualified",
    "Shortlisted",
    "Site Visit",
    "Negotiation",
    "Booked",
  ];
  const activeDeals = activeStatuses.reduce(
    (sum, status) => sum + (statusCounts[status] || 0),
    0
  );

  const conversionRate =
    totalLeads > 0 ? Math.round((convertedThisMonth / totalLeads) * 100) : 0;

  // Calculate revenue pipeline from active deals (filtered by managed agents)
  const activeLeadsWithValue = await Lead.find({
    "system.leadStatus": { $in: activeStatuses },
    "system.dealValue.amount": { $exists: true, $gt: 0 },
    "system.assignedAgent": { $in: managedAgentIds },
  })
    .select("system.dealValue")
    .lean();

  const revenuePipeline = activeLeadsWithValue.reduce((sum, lead: any) => {
    const value = lead.system?.dealValue?.amount || 0;
    return sum + value;
  }, 0);

  return {
    role: "sales_manager",
    stats: {
      totalLeads,
      activeDeals,
      teamConversionRate: conversionRate,
      monthlyConversions: convertedThisMonth,
      revenuePipeline,
      pipeline: statusCounts,
      teamPerformance: salesAgents.map((agent: any) => ({
        id: agent._id,
        name: agent.name,
        email: agent.email,
        assignedLeads: agent.assignedLeadsCount,
      })),
    },
  };
}

// Admin Dashboard Stats - Full system overview
export async function getAdminStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalLeads,
    convertedThisMonth,
    allLeads,
    totalProjects,
    activeProjects,
    totalProperties,
    projectsByStatus,
    propertiesByStatusAggregation,
    totalUsers,
    salesAgents,
    onboardingAgents,
    monthlyProjectTrend,
  ] = await Promise.all([
    Lead.countDocuments({}),
    Lead.countDocuments({
      "system.leadStatus": "Converted",
      updatedAt: { $gte: startOfMonth },
    }),
    Lead.aggregate([
      { $group: { _id: "$system.leadStatus", count: { $sum: 1 } } },
    ]),
    PropertyProject.countDocuments({}),
    PropertyProject.countDocuments({
      project_status: { $in: ["Under Construction", "Ready to Move", "Planning"] },
    }),
    PropertyModel.countDocuments({}),
    PropertyProject.aggregate([
      { $group: { _id: "$project_status", count: { $sum: 1 } } },
    ]),
    PropertyModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    User.countDocuments({}),
    User.aggregate([
      {
        $match: {
          role: { $in: ["sales_agent", Role.SalesAgent] },
        }
      },
      {
        $lookup: {
          from: "leads",
          let: { agentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$system.assignedAgent", "$$agentId"] } } },
            { $count: "count" }
          ],
          as: "leadCount"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          assignedLeadsCount: { $ifNull: [{ $arrayElemAt: ["$leadCount.count", 0] }, 0] }
        }
      }
    ]),
    User.find({
      role: { $in: ["developer", "onboarding_agent", Role.OnboardingAgent] },
    })
      .select("name email")
      .lean(),
    PropertyProject.aggregate([
      { $match: { created_at: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Transform aggregation results
  const pipeline = (allLeads as any[]).reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item._id || "New"] = item.count;
      return acc;
    },
    {}
  );

  const activeStatuses = ["Contacted", "Qualified", "Shortlisted", "Site Visit", "Negotiation", "Booked"];
  const activeDeals = activeStatuses.reduce((sum, status) => sum + (pipeline[status] || 0), 0);

  const conversionRate = totalLeads > 0 ? Math.round((convertedThisMonth / totalLeads) * 100) : 0;

  const projectStatusMap: Record<string, number> = {
    "Planning": 0,
    "Under Construction": 0,
    "Completed": 0,
    "Ready to Move": 0
  };
  projectsByStatus.forEach((item: any) => {
    projectStatusMap[item._id || "Unknown"] = item.count;
  });

  const propertyStatusMap: Record<string, number> = {
    "AVAILABLE": 0,
    "SOLD": 0,
    "RESERVED": 0,
    "UNDER_CONTRACT": 0
  };
  (propertiesByStatusAggregation as any[]).forEach((item: any) => {
    propertyStatusMap[item._id || "Unknown"] = item.count;
  });

  return {
    role: "admin",
    stats: {
      // Leads & Sales
      totalLeads,
      activeDeals,
      monthlyConversions: convertedThisMonth,
      conversionRate,
      pipeline,
      // Projects & Properties
      totalProjects,
      activeProjects,
      totalProperties,
      projectsByStatus: projectStatusMap,
      propertiesByStatus: propertyStatusMap,
      // Users & Teams
      totalUsers,
      salesAgents: salesAgents.map((agent: any) => ({
        id: agent._id,
        name: agent.name,
        email: agent.email,
        assignedLeads: agent.assignedLeadsCount,
      })),
      onboardingAgents: onboardingAgents.map((agent: any) => ({
        id: agent._id,
        name: agent.name,
        email: agent.email,
      })),
      // Growth
      growthTrend: monthlyProjectTrend.map((item: any) => ({
        month: item._id,
        projects: item.count,
      })),
    },
  };
}
export async function getSalesAgentLeadCount(userId: string) {
  try {
    const leadCount = await Lead.countDocuments({
      "system.assignedAgent": userId,
    })
    return leadCount;
  } catch (e) {
    console.log("e getsales agent lead count ", e)
    return 0;
  }

}

// Business Head Dashboard Stats
export async function getBusinessHeadStats(userId: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // 1. Fetch managed agents first
  const onboardingAgents = await User.find({
    role: { $in: ["developer", "onboarding_agent", Role.OnboardingAgent] },
    managedBy: userId,
  })
    .select("name email")
    .lean();

  // 2. Fetch stats filtered by managed agents
  const managedAgentObjectIds = managedAgentIds.map(id => new mongoose.Types.ObjectId(id));

  const [
    activeProjects,
    totalProjects,
    totalProperties,
    projectsByStatus,
    monthlyProjectTrend,
  ] = await Promise.all([
    PropertyProject.countDocuments({
      project_status: {
        $in: ["Under Construction", "Ready to Move", "Planning"],
      },
      assignedAgent: { $in: managedAgentObjectIds },
    } as any),
    PropertyProject.countDocuments({
      assignedAgent: { $in: managedAgentObjectIds },
    } as any),
    PropertyModel.countDocuments({
      assignedAgent: { $in: managedAgentObjectIds },
    } as any),
    PropertyProject.aggregate([
      { $match: { assignedAgent: { $in: managedAgentObjectIds } } },
      { $group: { _id: "$project_status", count: { $sum: 1 } } },
    ]),
    PropertyProject.aggregate([
      {
        $match: {
          created_at: { $gte: sixMonthsAgo },
          assignedAgent: { $in: managedAgentObjectIds },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const statusMap = projectsByStatus.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item._id || "Unknown"] = item.count;
      return acc;
    },
    {}
  );

  const completedProjects =
    (statusMap["Completed"] || 0) + (statusMap["Ready to Move"] || 0);
  const completionRate =
    totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;

  return {
    role: "business_head",
    stats: {
      activeProjects,
      totalProjects,
      totalProperties,
      onboardingCompletionRate: completionRate,
      projectsByStatus: statusMap,
      onboardingAgents: onboardingAgents.map((agent: any) => ({
        id: agent._id,
        name: agent.name,
        email: agent.email,
      })),
      growthTrend: monthlyProjectTrend.map((item: any) => ({
        month: item._id,
        projects: item.count,
      })),
    },
  };
}

// Sales Funnel Analytics
export async function getSalesFunnelData(
  startDate?: Date,
  endDate?: Date,
  agentId?: string
) {
  const query: any = {};

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  if (agentId) {
    query["system.assignedAgent"] = new mongoose.Types.ObjectId(agentId);
  }

  const stageCountsAggregation = await Lead.aggregate([
    { $match: query },
    { $group: { _id: "$system.leadStatus", count: { $sum: 1 } } },
  ]);

  const stageCounts: Record<string, number> = stageCountsAggregation.reduce(
    (acc: any, item: any) => {
      acc[item._id || "New"] = item.count;
      return acc;
    },
    {}
  );

  const totalLeads = stageCountsAggregation.reduce((sum, item) => sum + item.count, 0);
  const convertedLeads = stageCounts["Converted"] || 0;
  const overallConversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Calculate funnel data
  const funnelData = stages.map((stage, index) => {
    const count = stageCounts[stage] || 0;
    const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;

    // Conversion rate from previous stage
    let conversionRate = 100;
    if (index > 0) {
      const prevStageCount = stageCounts[stages[index - 1]] || 0;
      conversionRate = prevStageCount > 0 ? Math.round((count / prevStageCount) * 100) : 0;
    }

    return {
      stage,
      count,
      percentage,
      conversionRate,
    };
  });

  return {
    stages: funnelData,
    totalLeads,
    overallConversionRate,
    convertedLeads,
  };
}

// Main function to get dashboard stats based on role
export async function getDashboardStats(userId: string, role: string) {
  const normalizedRole = normalizeRole(role);

  switch (normalizedRole) {
    case "sales_agent":
      return getSalesAgentStats(userId);
    case "onboarding_agent":
      return getOnboardingAgentStats(userId);
    case "sales_manager":
      return getSalesManagerStats(userId);
    case "business_head":
      return getBusinessHeadStats(userId);
    case "admin":
      return getAdminStats();
    default:
      return getBusinessHeadStats(userId); // Default to business head view
  }
}
