import React, { useEffect, useState } from "react";
import {
  Mail,
  MessageCircle,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { communicationService, type Activity } from "@/services/communicationService";

interface ActivityTimelineProps {
  communicationId?: string;
  entityType?: string;
  entityId?: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  communicationId,
  entityType,
  entityId,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [communicationId, entityType, entityId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let response;
      if (communicationId) {
        response = await communicationService.getEntityTimeline(
          "communication",
          communicationId
        );
      } else if (entityType && entityId) {
        response = await communicationService.getEntityTimeline(
          entityType,
          entityId
        );
      }
      const data = response && response.data && Array.isArray(response.data.data) ? response.data.data : [];
      setActivities(data);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    if (activityType.includes("email")) {
      return <Mail className="h-4 w-4" />;
    }
    if (activityType.includes("whatsapp")) {
      return <MessageCircle className="h-4 w-4" />;
    }
    if (activityType.includes("call")) {
      return <Phone className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const getActivityColor = (activityType: string) => {
    if (activityType.includes("email")) return "text-blue-500 bg-blue-50";
    if (activityType.includes("whatsapp")) return "text-green-500 bg-green-50";
    if (activityType.includes("call")) return "text-purple-500 bg-purple-50";
    if (activityType.includes("task")) return "text-orange-500 bg-orange-50";
    return "text-gray-500 bg-gray-50";
  };

  const getStatusIcon = (status?: string) => {
    if (status === "sent" || status === "delivered" || status === "read") {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (status === "failed") {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatActivityType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No activities yet</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity Timeline</h3>
      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={activity._id || idx} className="flex gap-4">
            {/* Timeline line */}
            <div className="relative">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getActivityColor(activity.activity_type)}`}>
                {getActivityIcon(activity.activity_type)}
              </div>
              {idx !== activities.length - 1 && (
                <div className="absolute left-1/2 top-8 h-6 w-0.5 bg-gray-200 transform -translate-x-1/2" />
              )}
            </div>

            {/* Activity details */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-medium text-gray-900">
                    {activity.title || formatActivityType(activity.activity_type)}
                  </p>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activity.meta?.status && getStatusIcon(activity.meta.status)}
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(activity.created_at)}
                  </span>
                </div>
              </div>

              {/* Activity metadata */}
              {activity.performed_by && (
                <p className="text-xs text-gray-500">
                  By {activity.performed_by.name || activity.performed_by.email}
                </p>
              )}

              {/* Meta info */}
              {activity.meta && Object.keys(activity.meta).length > 0 && (
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  {activity.meta.status && (
                    <p>Status: <span className="font-medium">{activity.meta.status}</span></p>
                  )}
                  {activity.meta.duration && (
                    <p>Duration: <span className="font-medium">{activity.meta.duration}</span></p>
                  )}
                  {activity.meta.notes && (
                    <p className="italic text-gray-500">{activity.meta.notes}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
