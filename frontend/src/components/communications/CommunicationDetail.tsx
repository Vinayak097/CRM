import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Phone,
  Download,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { communicationService, type Communication } from "@/services/communicationService";
import ActivityTimeline from "./ActivityTimeline.tsx";

interface CommunicationDetailProps {
  communicationId: string;
  onBack: () => void;
  onDelete?: () => void;
}

const CommunicationDetail: React.FC<CommunicationDetailProps> = ({
  communicationId,
  onBack,
  onDelete,
}) => {
  const [communication, setCommunication] = useState<Communication | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCommunication();
  }, [communicationId]);

  const fetchCommunication = async () => {
    setLoading(true);
    try {
      const response = await communicationService.getCommunicationById(
        communicationId
      );
      setCommunication(response.data);
    } catch (error) {
      console.error("Failed to fetch communication:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this communication?")) return;

    setDeleting(true);
    try {
      await communicationService.deleteCommunication(communicationId);
      onDelete?.();
      onBack();
    } catch (error) {
      console.error("Failed to delete communication:", error);
      alert("Failed to delete communication");
    } finally {
      setDeleting(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-5 w-5" />;
      case "whatsapp":
        return <MessageCircle className="h-5 w-5" />;
      case "call":
      case "sms":
        return <Phone className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  const getChannelLabel = (channel: string) => {
    return channel.charAt(0).toUpperCase() + channel.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!communication) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <Mail className="h-12 w-12 mb-2 opacity-20" />
        <p className="text-sm">Communication not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </Button>
        </div>

        {/* Channel & Subject */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              {getChannelIcon(communication.channel)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {getChannelLabel(communication.channel)} · {communication.direction}
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                {communication.subject || "No subject"}
              </h2>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              {formatDate(communication.created_at)}
            </div>
            <div className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
              {communication.status}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* From/To */}
        <div className="border-b border-gray-200 p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">FROM</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {communication.from.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{communication.from.name}</p>
                {communication.from.email && (
                  <p className="text-sm text-gray-600">{communication.from.email}</p>
                )}
                {communication.from.phone && (
                  <p className="text-sm text-gray-600">{communication.from.phone}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">TO</p>
            <div className="space-y-2">
              {communication.to.map((recipient, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-bold text-sm">
                    {recipient.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{recipient.name}</p>
                    {recipient.email && (
                      <p className="text-sm text-gray-600">{recipient.email}</p>
                    )}
                    {recipient.phone && (
                      <p className="text-sm text-gray-600">{recipient.phone}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Body */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
            {communication.message}
          </div>
        </div>

        {/* Attachments */}
        {communication.attachments && communication.attachments.length > 0 && (
          <div className="border-b border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-900 mb-3">Attachments</p>
            <div className="space-y-2">
              {communication.attachments.map((attachment, idx) => (
                <a
                  key={idx}
                  href={attachment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={16} className="text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.file_name}
                    </p>
                    <p className="text-xs text-gray-500">{attachment.file_type}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="p-6">
          <ActivityTimeline communicationId={communicationId} />
        </div>
      </div>
    </div>
  );
};

export default CommunicationDetail;
