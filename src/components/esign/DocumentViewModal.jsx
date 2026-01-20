// src/components/esign/DocumentViewModal.jsx
// Modal for viewing document signing status and details

import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Download, RefreshCw, Send, Clock, Check, 
  AlertCircle, XCircle, Eye, User, Mail, Phone, Building2,
  Calendar, ExternalLink, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  getSigningRequest, 
  syncDocumentStatus, 
  downloadSignedDocument,
  resendToSigner,
  cancelSigningRequest
} from '@/services/esignService';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
  viewed: { label: 'Viewed', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
  partially_signed: { label: 'Partially Signed', color: 'bg-orange-100 text-orange-700', icon: Clock },
  signed: { label: 'Signed', color: 'bg-emerald-100 text-emerald-700', icon: Check },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: Check },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700', icon: Clock },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: XCircle }
};

const SIGNER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-gray-500' },
  sent: { label: 'Sent', color: 'text-blue-600' },
  opened: { label: 'Opened', color: 'text-yellow-600' },
  signed: { label: 'Signed', color: 'text-emerald-600' },
  declined: { label: 'Declined', color: 'text-red-600' }
};

const DocumentViewModal = ({
  isOpen,
  onClose,
  documentId,
  onRefresh = () => {}
}) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('signers');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
    }
  }, [isOpen, documentId]);

  const loadDocument = async () => {
    setLoading(true);
    const { data, error } = await getSigningRequest(documentId);
    if (!error && data) {
      setDocument(data);
    }
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    await syncDocumentStatus(documentId);
    await loadDocument();
    onRefresh();
    setSyncing(false);
  };

  const handleDownload = async () => {
    const { url, name } = await downloadSignedDocument(documentId);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleResend = async (signerId) => {
    setActionLoading(signerId);
    await resendToSigner(signerId);
    setActionLoading(null);
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this signing request?')) return;
    setActionLoading('cancel');
    await cancelSigningRequest(documentId);
    await loadDocument();
    onRefresh();
    setActionLoading(null);
  };

  if (!isOpen) return null;

  const status = STATUS_CONFIG[document?.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {loading ? 'Loading...' : document?.document_name || 'Document'}
              </h2>
              {document && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", status.color)}>
                    {status.label}
                  </span>
                  {document.entity_name && (
                    <span className="text-xs text-gray-500">{document.entity_name}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : document ? (
          <>
            {/* Tabs */}
            <div className="px-6 border-b">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('signers')}
                  className={cn(
                    "py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                    activeTab === 'signers' 
                      ? "border-emerald-600 text-emerald-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  Signers ({document.document_signers?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={cn(
                    "py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                    activeTab === 'details' 
                      ? "border-emerald-600 text-emerald-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  Details
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'signers' && (
                <div className="space-y-4">
                  {document.document_signers?.map((signer, index) => {
                    const signerStatus = SIGNER_STATUS_CONFIG[signer.status] || SIGNER_STATUS_CONFIG.pending;
                    return (
                      <div key={signer.id || index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{signer.name}</p>
                                <span className={cn("text-xs", signerStatus.color)}>
                                  {signerStatus.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">{signer.role}</p>
                              
                              <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3.5 h-3.5" />
                                  {signer.email}
                                </div>
                                {signer.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5" />
                                    {signer.phone}
                                  </div>
                                )}
                                {signer.company && (
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {signer.company}
                                  </div>
                                )}
                              </div>

                              {signer.signed_at && (
                                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Signed on {new Date(signer.signed_at).toLocaleString()}
                                </p>
                              )}

                              {signer.contact_auto_matched && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Auto-linked to contact record
                                </p>
                              )}
                            </div>
                          </div>

                          {signer.status !== 'signed' && document.status !== 'completed' && document.status !== 'cancelled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResend(signer.id)}
                              disabled={actionLoading === signer.id}
                            >
                              {actionLoading === signer.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Send className="w-3 h-3 mr-1" />
                                  Resend
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Timeline */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3">Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Created:</span>
                        <span>{new Date(document.created_at).toLocaleString()}</span>
                      </div>
                      {document.sent_at && (
                        <div className="flex items-center gap-3 text-sm">
                          <Send className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-500">Sent:</span>
                          <span>{new Date(document.sent_at).toLocaleString()}</span>
                        </div>
                      )}
                      {document.viewed_at && (
                        <div className="flex items-center gap-3 text-sm">
                          <Eye className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-500">First Viewed:</span>
                          <span>{new Date(document.viewed_at).toLocaleString()}</span>
                        </div>
                      )}
                      {document.completed_at && (
                        <div className="flex items-center gap-3 text-sm">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-gray-500">Completed:</span>
                          <span>{new Date(document.completed_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Document Name</p>
                      <p className="font-medium">{document.document_name}</p>
                    </div>
                    {document.entity_name && (
                      <div>
                        <p className="text-xs text-gray-500">Linked To</p>
                        <p className="font-medium">{document.entity_name} ({document.entity_type})</p>
                      </div>
                    )}
                    {document.notes && (
                      <div>
                        <p className="text-xs text-gray-500">Notes</p>
                        <p className="text-sm">{document.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Storage Info */}
                  {document.storage_url && (
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-emerald-800 mb-2">Signed Document Stored</h4>
                      <p className="text-xs text-emerald-600 break-all">{document.storage_path}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  {syncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh Status
                    </>
                  )}
                </Button>

                {document.status !== 'completed' && document.status !== 'cancelled' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={actionLoading === 'cancel'}
                    className="text-red-600 hover:text-red-700"
                  >
                    {actionLoading === 'cancel' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {document.storage_url && (
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <AlertCircle className="w-5 h-5 mr-2" />
            Document not found
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewModal;
