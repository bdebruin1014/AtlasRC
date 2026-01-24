// src/pages/projects/Bids/BidDetail.jsx
// Detail view of a single bid with evaluation and award actions

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Award, Star, Calendar, User, FileText, DollarSign,
  CheckCircle, XCircle, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBidDetail, useBidActions } from '@/hooks/useBids';
import { getBidTypeLabel, getScopeCategoryLabel, getStatusConfig, BID_DOCUMENT_TYPES } from '@/services/bidService';

const formatCurrency = (amount) => {
  if (!amount) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const BidDetail = ({ open, bidId, projectId, onUpdated, onClose }) => {
  const { bid, documents, loading, refetch } = useBidDetail(bidId);
  const { changeStatus, award, score: scoreBid, saving } = useBidActions(projectId);

  const [showScore, setShowScore] = useState(false);
  const [scoreValue, setScoreValue] = useState('');
  const [evalNotes, setEvalNotes] = useState('');

  const handleScore = async () => {
    const s = parseInt(scoreValue);
    if (!s || s < 1 || s > 100) return;
    await scoreBid(bidId, s, evalNotes);
    setShowScore(false);
    setScoreValue('');
    setEvalNotes('');
    refetch();
    onUpdated?.();
  };

  const handleAward = async () => {
    await award(bidId);
    refetch();
    onUpdated?.();
  };

  const handleReject = async () => {
    await changeStatus(bidId, 'rejected', 'Not selected for this scope.');
    refetch();
    onUpdated?.();
  };

  if (loading || !bid) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusConfig = getStatusConfig(bid.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="flex items-center gap-2">
              {bid.bidder_name}
              {bid.awarded && <Award className="w-5 h-5 text-green-600" />}
            </DialogTitle>
            <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Amount Card */}
          <div className={cn(
            "rounded-lg p-4 border text-center",
            bid.awarded ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
          )}>
            <p className="text-xs text-gray-600 mb-1">{getScopeCategoryLabel(bid.scope_category)}</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(bid.bid_amount)}</p>
            {bid.alternate_amount && (
              <p className="text-xs text-gray-500 mt-1">
                Alternate: {formatCurrency(bid.alternate_amount)}
              </p>
            )}
            {bid.awarded && (
              <p className="text-xs mt-2 text-green-700 font-medium">
                Awarded on {formatDate(bid.awarded_date)}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Company</p>
                  <p className="text-sm font-medium text-gray-800">{bid.bidder_name}</p>
                  {bid.bidder_contact_name && (
                    <p className="text-xs text-gray-400">Contact: {bid.bidder_contact_name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Bid Type</p>
                  <p className="text-sm font-medium text-gray-800">{getBidTypeLabel(bid.bid_type)}</p>
                </div>
              </div>
              {bid.score && (
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Score</p>
                    <p className={cn(
                      "text-sm font-bold",
                      bid.score >= 80 ? "text-green-600" : bid.score >= 60 ? "text-amber-600" : "text-red-600"
                    )}>
                      {bid.score}/100
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Received</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(bid.received_date)}</p>
                </div>
              </div>
              {bid.valid_until && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Valid Until</p>
                    <p className={cn(
                      "text-sm font-medium",
                      new Date(bid.valid_until) < new Date() ? "text-red-600" : "text-gray-800"
                    )}>
                      {formatDate(bid.valid_until)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scope Description */}
          {bid.scope_description && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Scope of Work</p>
              <p className="text-sm text-gray-700">{bid.scope_description}</p>
            </div>
          )}

          {/* Inclusions & Exclusions */}
          {(bid.inclusions || bid.exclusions) && (
            <div className="grid grid-cols-2 gap-4">
              {bid.inclusions && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs font-medium text-green-700 mb-1">Inclusions</p>
                  <p className="text-xs text-green-800 whitespace-pre-wrap">{bid.inclusions}</p>
                </div>
              )}
              {bid.exclusions && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <p className="text-xs font-medium text-red-700 mb-1">Exclusions</p>
                  <p className="text-xs text-red-800 whitespace-pre-wrap">{bid.exclusions}</p>
                </div>
              )}
            </div>
          )}

          {/* Qualifications */}
          {bid.qualifications && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Qualifications</p>
              <p className="text-sm text-gray-700">{bid.qualifications}</p>
            </div>
          )}

          {/* Evaluation Notes */}
          {bid.evaluation_notes && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p className="text-xs font-medium text-amber-700 mb-1">Evaluation Notes</p>
              <p className="text-sm text-amber-800">{bid.evaluation_notes}</p>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Documents ({documents.length})</h4>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{doc.file_name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {BID_DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {bid.notes && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{bid.notes}</p>
            </div>
          )}

          {/* Inline Score Form */}
          {showScore && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <Label className="text-sm text-amber-700">Score (1-100)</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={scoreValue}
                  onChange={(e) => setScoreValue(e.target.value)}
                  className="w-24"
                  placeholder="85"
                />
                <Input
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  className="flex-1"
                  placeholder="Evaluation notes..."
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowScore(false)}>Cancel</Button>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleScore} disabled={saving || !scoreValue}>
                  {saving ? 'Saving...' : 'Save Score'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <div className="flex items-center gap-2">
            {!bid.awarded && bid.status !== 'rejected' && (
              <>
                {!showScore && (
                  <Button variant="outline" size="sm" onClick={() => setShowScore(true)}>
                    <Star className="w-4 h-4 mr-1" /> Score
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleReject}
                  disabled={saving}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleAward}
                  disabled={saving}
                >
                  <Award className="w-4 h-4 mr-1" /> Award Bid
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BidDetail;
