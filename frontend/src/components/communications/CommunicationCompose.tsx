import React, { useState, useRef } from "react";
import { X, Send, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { communicationService } from "@/services/communicationService";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  entityType?: string;
  entityId?: string;
  toContact?: { name: string; email?: string; phone?: string };
}

const CommunicationCompose: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  entityType,
  entityId,
  toContact,
}) => {
  const [formData, setFormData] = useState({
    channel: "email" as "email" | "whatsapp" | "call" | "sms",
    to: [
      {
        name: toContact?.name || "",
        email: toContact?.email || "",
        phone: toContact?.phone || "",
      },
    ],
    subject: "",
    message: "",
    attachments: [] as File[],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChannelChange = (channel: string) => {
    setFormData({
      ...formData,
      channel: channel as "email" | "whatsapp" | "call" | "sms",
    });
    setErrors({ ...errors, channel: "" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRecipientChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      to: [
        {
          ...prev.to[0],
          [field]: value,
        },
      ],
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files!)],
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.to[0].name) newErrors.to = "Recipient name is required";
    if (!formData.to[0].email && !formData.to[0].phone) {
      newErrors.contact = "Email or phone is required";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        channel: formData.channel,
        direction: "outbound" as const,
        subject: formData.subject,
        message: formData.message,
        from: {
          name: "CRM System",
          email: "noreply@avacasa.com",
        },
        to: formData.to,
        status: "sent" as const,
        ...(entityType &&
          entityId && {
            related_to: {
              type: entityType as "lead" | "property" | "customer" | "deal",
              id: entityId,
            },
          }),
      };

      await communicationService.createCommunication(payload);

      setFormData({
        channel: "email",
        to: [{ name: "", email: "", phone: "" }],
        subject: "",
        message: "",
        attachments: [],
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || "Failed to send communication",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">New Communication</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Channel
            </label>
            <select
              value={formData.channel}
              onChange={(e) => handleChannelChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="call">Call</option>
            </select>
          </div>

          {/* Recipient */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">
              To
            </label>
            <Input
              placeholder="Recipient name"
              value={formData.to[0].name}
              onChange={(e) => handleRecipientChange("name", e.target.value)}
              className={errors.to ? "border-red-500" : ""}
            />
            {formData.channel === "email" || formData.channel === "whatsapp" ? (
              <Input
                type="email"
                placeholder={`${formData.channel === "email" ? "Email" : "Phone"} address`}
                value={
                  formData.channel === "email"
                    ? formData.to[0].email
                    : formData.to[0].phone
                }
                onChange={(e) =>
                  handleRecipientChange(
                    formData.channel === "email" ? "email" : "phone",
                    e.target.value
                  )
                }
                className={errors.contact ? "border-red-500" : ""}
              />
            ) : (
              <Input
                type="tel"
                placeholder="Phone number"
                value={formData.to[0].phone}
                onChange={(e) => handleRecipientChange("phone", e.target.value)}
                className={errors.contact ? "border-red-500" : ""}
              />
            )}
            {(errors.to || errors.contact) && (
              <p className="text-sm text-red-500">
                {errors.to || errors.contact}
              </p>
            )}
          </div>

          {/* Subject */}
          {(formData.channel === "email" || formData.channel === "whatsapp") && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Subject
              </label>
              <Input
                name="subject"
                placeholder="Message subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={errors.subject ? "border-red-500" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
              )}
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Message
            </label>
            <textarea
              name="message"
              placeholder="Type your message..."
              value={formData.message}
              onChange={handleInputChange}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.message ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.message && (
              <p className="text-sm text-red-500 mt-1">{errors.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.message.length} characters
            </p>
          </div>

          {/* Attachments */}
          {formData.channel === "email" && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Attachments
              </label>
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Paperclip className="h-5 w-5 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to add files or drag and drop
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Attached files */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)}KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunicationCompose;
