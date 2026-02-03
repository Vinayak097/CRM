import React, { useState, useEffect } from "react";
import {
  Mail,
  MessageCircle,
  Phone,
  Search,
  Plus,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { communicationService, type Communication } from "@/services/communicationService";
import CommunicationDetail from "./CommunicationDetail";
import CommunicationCompose from "./CommunicationCompose";

interface CommunicationInboxProps {
  entityType?: "lead" | "customer" | "deal" | "property";
  entityId?: string;
}

const CommunicationInbox: React.FC<CommunicationInboxProps> = ({
  entityType,
  entityId,
}) => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedCommunicationId, setSelectedCommunicationId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  useEffect(() => {
    fetchCommunications();
  }, [selectedChannel, entityType, entityId]);

  const fetchCommunications = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: 50,
      };

      if (selectedChannel) params.channel = selectedChannel;
      if (entityType && entityId) {
        params.entityType = entityType;
        params.entityId = entityId;
      }

      const response = await communicationService.getCommunications(params);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setCommunications(data);
    } catch (error) {
      console.error("Failed to fetch communications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      fetchCommunications();
      return;
    }

    setLoading(true);
    try {
      const response = await communicationService.searchCommunications(query);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setCommunications(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommunication = (communication: Communication) => {
    setSelectedCommunicationId(communication._id);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setSelectedCommunicationId(null);
    setViewMode("list");
  };

  const handleDeleteCommunication = () => {
    fetchCommunications();
    setViewMode("list");
  };

  const handleComposeSuccess = () => {
    fetchCommunications();
    setShowCompose(false);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "whatsapp":
        return <MessageCircle className="h-4 w-4" />;
      case "call":
      case "sms":
        return <Phone className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "email":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
      case "whatsapp":
        return "bg-green-50 border-green-200 hover:bg-green-100";
      case "call":
        return "bg-purple-50 border-purple-200 hover:bg-purple-100";
      case "sms":
        return "bg-orange-50 border-orange-200 hover:bg-orange-100";
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      sent: "bg-yellow-100 text-yellow-800",
      delivered: "bg-blue-100 text-blue-800",
      read: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const channels = [
    { id: null, label: "All", count: communications.length },
    {
      id: "email",
      label: "Email",
      count: communications.filter((c) => c.channel === "email").length,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      count: communications.filter((c) => c.channel === "whatsapp").length,
    },
    {
      id: "call",
      label: "Calls",
      count: communications.filter((c) => c.channel === "call").length,
    },
  ];
  // Show detail view if a communication is selected
  if (viewMode === "detail" && selectedCommunicationId) {
    return (
      <CommunicationDetail
        communicationId={selectedCommunicationId}
        onBack={handleBackToList}
        onDelete={handleDeleteCommunication}
      />
    );
  }
  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Communications</h1>
            <Button
              size="sm"
              onClick={() => setShowCompose(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus size={16} />
              Compose
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search messages, subjects, names..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        {/* Channel Filters */}
        <div className="border-b border-gray-200 px-4 py-3 flex gap-2 overflow-x-auto">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedChannel === channel.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {channel.label}
              <span className="ml-1 text-xs opacity-75">({channel.count})</span>
            </button>
          ))}
        </div>

        {/* Communications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
            </div>
          ) : communications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mail className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">No communications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {communications.map((communication) => (
                <button
                  key={communication._id}
                  onClick={() => handleSelectCommunication(communication)}
                  className={`w-full text-left p-4 border-l-4 transition-colors ${
                    selectedCommunicationId === communication._id
                      ? "bg-blue-50 border-l-blue-600"
                      : "border-l-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Channel Icon */}
                    <div
                      className={`p-2 rounded-lg shrink-0 ${getChannelColor(
                        communication.channel
                      )}`}
                    >
                      {getChannelIcon(communication.channel)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {communication.from.name}
                        </p>
                        <span className="text-xs text-gray-500 shrink-0">
                          {formatDate(communication.created_at)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 truncate">
                        {communication.subject || communication.message.substring(0, 50)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
                            communication.status
                          )}`}
                        >
                          {communication.status}
                        </span>
                        {communication.attachments &&
                          communication.attachments.length > 0 && (
                            <span className="text-xs text-gray-500">
                              📎 {communication.attachments.length}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <CommunicationCompose
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        onSuccess={handleComposeSuccess}
        entityType={entityType}
        entityId={entityId}
      />
    </>
  );
};

export default CommunicationInbox;
