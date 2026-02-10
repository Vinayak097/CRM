import User from '../models/User.js';
import { PropertyModel } from '../models/property.model.js';
import PropertyProject from '../models/project.model.js';
import { AppError } from '../utils/errorHandler.js';

export class OnboardingService {
    // Submit for approval
    async submitForApproval(userId: string, itemId: string, type: 'Property' | 'Project') {
        const user = await User.findById(userId);
        if (!user) throw new AppError('User not found', 404);

        const field = type === 'Property' ? 'assignedProperties' : 'assignedProjects';
        const idField = type === 'Property' ? 'propertyId' : 'projectId';

        let item = (user[field] as any[]).find(i => i[idField] === itemId);
        if (!item) {
            // If doesn't exist, create it as submitted
            (user[field] as any[]).push({
                [idField]: itemId,
                status: 'Submitted',
                updatedAt: new Date()
            });
        } else {
            item.status = 'Submitted';
            item.updatedAt = new Date();
        }

        await user.save();
        return user;
    }

    // Approve item
    async approveItem(managerId: string, agentId: string, itemId: string, type: 'Property' | 'Project') {
        const agent = await User.findById(agentId);
        if (!agent) throw new AppError('Agent not found', 404);

        // Verify manager
        if (agent.managedBy?.toString() !== managerId) {
            throw new AppError('You are not authorized to approve this agent\'s work', 403);
        }

        const field = type === 'Property' ? 'assignedProperties' : 'assignedProjects';
        const idField = type === 'Property' ? 'propertyId' : 'projectId';

        let item = (agent[field] as any[]).find(i => i[idField] === itemId);
        if (!item || item.status !== 'Submitted') {
            throw new AppError('Item is not in Submitted state', 400);
        }

        item.status = 'Approved';
        item.updatedAt = new Date();

        // Also update the actual property/project verified status
        if (type === 'Property') {
            await PropertyModel.findByIdAndUpdate(itemId, { isVerified: true, published_at: new Date() });
        } else {
            await PropertyProject.findByIdAndUpdate(itemId, { isVerified: true });
        }

        // Add to manager's assigned items as requested
        const manager = await User.findById(managerId);
        if (manager) {
            let mItem = (manager[field] as any[]).find(i => i[idField] === itemId);
            if (!mItem) {
                (manager[field] as any[]).push({
                    [idField]: itemId,
                    status: 'Approved',
                    updatedAt: new Date()
                });
            } else {
                mItem.status = 'Approved';
                mItem.updatedAt = new Date();
            }
            await manager.save();
        }

        await agent.save();
        return agent;
    }

    // Reject item
    async rejectItem(managerId: string, agentId: string, itemId: string, type: 'Property' | 'Project', reason: string) {
        const agent = await User.findById(agentId);
        if (!agent) throw new AppError('Agent not found', 404);

        if (agent.managedBy?.toString() !== managerId) {
            throw new AppError('You are not authorized to reject this agent\'s work', 403);
        }

        const field = type === 'Property' ? 'assignedProperties' : 'assignedProjects';
        const idField = type === 'Property' ? 'propertyId' : 'projectId';

        let item = (agent[field] as any[]).find(i => i[idField] === itemId);
        if (!item || item.status !== 'Submitted') {
            throw new AppError('Item is not in Submitted state', 400);
        }

        item.status = 'Rejected';
        item.rejectionReason = reason;
        item.updatedAt = new Date();

        await agent.save();
        return agent;
    }
}
