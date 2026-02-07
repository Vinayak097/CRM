import Lead from "../models/Lead.js";
import PropertyProject from "../models/project.model.js";
import { PropertyModel } from "../models/property.model.js";
import User from "../models/User.js";
import { Role } from "../models/User.js";

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

  const [assignedLeads, convertedThisMonth, allLeads] = await Promise.all([
    Lead.countDocuments({ "system.assignedAgent": userId }),
    Lead.countDocuments({
      "system.assignedAgent": userId,
      "system.leadStatus": "Converted",
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
    }),
    Lead.find({ "system.assignedAgent": userId }).select("system.leadStatus").lean(),
  ]);

  // Count leads by status for pipeline
  const statusCounts = allLeads.reduce(
    (acc: Record<string, number>, lead: any) => {
      const status = lead.system?.leadStatus || "New";
      acc[status] = (acc[status] || 0) + 1;
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

  // 1. Fetch managed agents first
  const salesAgents = await User.find({
    role: { $in: ["sales_agent", Role.SalesAgent] },
    managedBy: userId,
  })
    .select("name email assignedLeadsCount")
    .lean();

  const managedAgentIds = salesAgents.map((agent) => agent._id);

  // 2. Fetch stats filtered by managed agents
  const [totalLeads, convertedThisMonth, allLeads] = await Promise.all([
    Lead.countDocuments({ "system.assignedAgent": { $in: managedAgentIds } }),
    Lead.countDocuments({
      "system.leadStatus": "Converted",
      updatedAt: { $gte: startOfMonth },
      "system.assignedAgent": { $in: managedAgentIds },
    }),
    Lead.find({ "system.assignedAgent": { $in: managedAgentIds } })
      .select("system.leadStatus")
      .lean(),
  ]);

  // Count leads by status
  const statusCounts = allLeads.reduce(
    (acc: Record<string, number>, lead: any) => {
      const status = lead.system?.leadStatus || "New";
      acc[status] = (acc[status] || 0) + 1;
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
        assignedLeads: agent.assignedLeadsCount || 0,
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
    Lead.find({}).select("system.leadStatus").lean(),
    PropertyProject.countDocuments({}),
    PropertyProject.countDocuments({
      project_status: { $in: ["Under Construction", "Ready to Move", "Planning"] },
    }),
    PropertyModel.countDocuments({}),
    PropertyProject.aggregate([
      { $group: { _id: "$project_status", count: { $sum: 1 } } },
    ]),
    User.countDocuments({}),
    User.find({ role: { $in: ["sales_agent", Role.SalesAgent] } })
      .select("name email assignedLeadsCount")
      .lean(),
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

  // Count leads by status
  const pipeline = allLeads.reduce(
    (acc: Record<string, number>, lead: any) => {
      const status = lead.system?.leadStatus || "New";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  const activeStatuses = ["Contacted", "Qualified", "Shortlisted", "Site Visit", "Negotiation", "Booked"];
  const activeDeals = activeStatuses.reduce((sum, status) => sum + (pipeline[status] || 0), 0);

  const conversionRate = totalLeads > 0 ? Math.round((convertedThisMonth / totalLeads) * 100) : 0;

  const projectStatusMap = projectsByStatus.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item._id || "Unknown"] = item.count;
      return acc;
    },
    {}
  );

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
      // Users & Teams
      totalUsers,
      salesAgents: salesAgents.map((agent: any) => ({
        id: agent._id,
        name: agent.name,
        email: agent.email,
        assignedLeads: agent.assignedLeadsCount || 0,
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

  const managedAgentIds = onboardingAgents.map((agent) => agent._id);

  // 2. Fetch stats filtered by managed agents
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
      assignedAgent: { $in: managedAgentIds },
    }),
    PropertyProject.countDocuments({
      assignedAgent: { $in: managedAgentIds },
    }),
    PropertyModel.countDocuments({
      assignedAgent: { $in: managedAgentIds },
    }),
    PropertyProject.aggregate([
      { $match: { assignedAgent: { $in: managedAgentIds } } },
      { $group: { _id: "$project_status", count: { $sum: 1 } } },
    ]),
    PropertyProject.aggregate([
      {
        $match: {
          created_at: { $gte: sixMonthsAgo },
          assignedAgent: { $in: managedAgentIds },
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
    query["system.assignedAgent"] = agentId;
  }

  const leads = await Lead.find(query).select("system.leadStatus createdAt updatedAt").lean();

  const stages = ["New", "Contacted", "Qualified", "Shortlisted", "Site Visit", "Negotiation", "Booked", "Converted"];

  // Count leads at each stage
  const stageCounts: Record<string, number> = {};
  stages.forEach(stage => {
    stageCounts[stage] = leads.filter((lead: any) => lead.system?.leadStatus === stage).length;
  });

  const totalLeads = leads.length;
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
