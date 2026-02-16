/**
 * Notification Triggers — fires notifications based on real events.
 * Import and call these from the relevant hooks/services after mutations succeed.
 */
import { createNotification } from './notificationService';

export const notificationTriggers = {
  /**
   * Fire when a DD deadline is approaching (within N days)
   */
  async ddDeadlineApproaching({ projectId, projectName, deadline, daysRemaining, userId }) {
    return createNotification({
      userId,
      title: `DD Deadline in ${daysRemaining} days`,
      message: `${projectName} — due diligence deadline is ${new Date(deadline).toLocaleDateString()}`,
      type: 'alert',
      priority: daysRemaining <= 3 ? 'urgent' : 'high',
      entityType: 'project',
      entityId: projectId,
      actionUrl: `/project/${projectId}`,
      metadata: { deadline, daysRemaining },
    });
  },

  /**
   * Fire when a follow-up on an opportunity is overdue
   */
  async followUpOverdue({ opportunityId, address, dealNumber, userId }) {
    return createNotification({
      userId,
      title: 'Follow-up overdue',
      message: `${address || dealNumber} — scheduled follow-up is past due`,
      type: 'warning',
      priority: 'high',
      entityType: 'opportunity',
      entityId: opportunityId,
      actionUrl: `/opportunity/${opportunityId}`,
    });
  },

  /**
   * Fire when a project goes over budget
   */
  async projectOverBudget({ projectId, projectName, budget, actualCost, userId }) {
    const overage = ((actualCost / budget - 1) * 100).toFixed(1);
    return createNotification({
      userId,
      title: `Over budget: ${projectName}`,
      message: `${projectName} is ${overage}% over budget ($${actualCost.toLocaleString()} vs $${budget.toLocaleString()})`,
      type: 'budget_alert',
      priority: 'urgent',
      entityType: 'project',
      entityId: projectId,
      actionUrl: `/project/${projectId}`,
      metadata: { budget, actualCost, overage },
    });
  },

  /**
   * Fire when a house reaches a milestone
   */
  async houseMilestoneAdvanced({ houseId, houseName, milestone, projectId, userId }) {
    return createNotification({
      userId,
      title: `Milestone: ${milestone}`,
      message: `${houseName} has reached the "${milestone}" milestone`,
      type: 'milestone_complete',
      priority: 'normal',
      entityType: 'house',
      entityId: houseId,
      actionUrl: projectId ? `/project/${projectId}` : `/construction`,
      metadata: { milestone },
    });
  },

  /**
   * Fire when a draw request is approved
   */
  async drawApproved({ drawId, projectId, projectName, amount, userId }) {
    return createNotification({
      userId,
      title: 'Draw Approved',
      message: `Draw #${drawId} for ${projectName} ($${amount.toLocaleString()}) has been approved`,
      type: 'draw_request',
      priority: 'normal',
      entityType: 'project',
      entityId: projectId,
      actionUrl: `/project/${projectId}`,
      metadata: { drawId, amount },
    });
  },

  /**
   * Fire when an opportunity is converted to a project
   */
  async opportunityConverted({ opportunityId, projectId, projectName, userId }) {
    return createNotification({
      userId,
      title: 'Opportunity Converted',
      message: `"${projectName}" has been created from an opportunity`,
      type: 'success',
      priority: 'normal',
      entityType: 'project',
      entityId: projectId,
      actionUrl: `/project/${projectId}`,
      metadata: { opportunityId },
    });
  },

  /**
   * Fire when a bill is past due
   */
  async billPastDue({ billId, vendorName, amount, dueDate, entityId, userId }) {
    return createNotification({
      userId,
      title: `Bill past due: ${vendorName}`,
      message: `$${amount.toLocaleString()} due on ${new Date(dueDate).toLocaleDateString()} is past due`,
      type: 'warning',
      priority: 'high',
      entityType: 'bill',
      entityId: billId,
      actionUrl: entityId ? `/accounting/entity/${entityId}/bills` : '/accounting/dashboard',
      metadata: { vendorName, amount, dueDate },
    });
  },

  /**
   * Fire when a project status changes
   */
  async projectStatusChanged({ projectId, projectName, oldStatus, newStatus, userId }) {
    return createNotification({
      userId,
      title: `Project status: ${newStatus}`,
      message: `${projectName} status changed from ${oldStatus} to ${newStatus}`,
      type: 'info',
      priority: 'normal',
      entityType: 'project',
      entityId: projectId,
      actionUrl: `/project/${projectId}`,
      metadata: { oldStatus, newStatus },
    });
  },
};

export default notificationTriggers;
