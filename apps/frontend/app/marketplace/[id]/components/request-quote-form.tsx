'use client';

import { useActionState, useEffect, useState } from 'react';
import { SubmitButton } from '@/app/components/submit-button';
import { trackMarketplaceEvent } from '@/lib/marketplace-analytics';
import type { ActionState } from '@/lib/types';
import { requestQuoteAction, type RequestQuoteActionState } from '../actions';

const initialState: RequestQuoteActionState = {};

interface RequestQuoteFormProps {
  adSlotId: string;
  adSlotName: string;
  defaultCompanyName?: string;
  defaultEmail?: string;
}

export function RequestQuoteForm({
  adSlotId,
  adSlotName,
  defaultCompanyName,
  defaultEmail,
}: RequestQuoteFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    trackMarketplaceEvent('marketplace_quote_open', { adSlotId });
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Need custom terms?
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Request custom pricing, compliance review, or contract terms. Typical response within 2
          business days.
        </p>
        <button
          type="button"
          onClick={handleOpen}
          className="btn btn-secondary btn-md mt-4 w-full cursor-pointer"
        >
          Request Custom Quote
        </button>
      </div>
    );
  }

  return (
    <RequestQuoteModal
      adSlotId={adSlotId}
      adSlotName={adSlotName}
      defaultCompanyName={defaultCompanyName}
      defaultEmail={defaultEmail}
      onClose={() => setIsOpen(false)}
    />
  );
}

function RequestQuoteModal({
  adSlotId,
  adSlotName,
  defaultCompanyName,
  defaultEmail,
  onClose,
}: RequestQuoteFormProps & { onClose: () => void }) {
  const [state, formAction] = useActionState(requestQuoteAction, initialState);
  useEffect(() => {
    if (state.success) {
      trackMarketplaceEvent('marketplace_quote_success', { adSlotId, quoteId: state.quoteId });
      return;
    }
    if (state.error) {
      trackMarketplaceEvent('marketplace_quote_error', { adSlotId, error: state.error });
    }
  }, [adSlotId, state.error, state.quoteId, state.success]);

  const [companyName, setCompanyName] = useState(defaultCompanyName ?? '');
  const [workEmail, setWorkEmail] = useState(defaultEmail ?? '');
  const [phone, setPhone] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [timelineStart, setTimelineStart] = useState('');
  const [timelineEnd, setTimelineEnd] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [legalEntityName, setLegalEntityName] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [complianceAcknowledgement, setComplianceAcknowledgement] = useState(false);

  if (state.success) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Quote Request Received
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            We shared your request for <span className="font-semibold">{adSlotName}</span>. Our team
            will follow up {state.estimatedResponseTime?.toLowerCase() ?? 'within 2 business days'}.
          </p>
          <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3 text-sm">
            <p>
              <span className="font-medium">Quote ID:</span> {state.quoteId}
            </p>
            <p className="mt-1">
              <span className="font-medium">Verification:</span> {state.verificationLevel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary btn-md mt-5 w-full cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const fieldErrors = (state as ActionState).fieldErrors;

  return (
    <div className="modal-overlay">
      <div className="modal-content request-form min-w-[80vh] overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Request a Custom Quote
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            For {adSlotName}. Share campaign and compliance details so we can tailor pricing.
          </p>
        </div>

        {state.error && (
          <div className="alert-error mb-4 rounded-[var(--radius-sm)] p-3 text-sm">
            {state.error}
          </div>
        )}

        <form
          action={formAction}
          className="space-y-4"
          onSubmit={() => trackMarketplaceEvent('marketplace_quote_submit', { adSlotId })}
        >
          <input type="hidden" name="adSlotId" value={adSlotId} />

          <div>
            <label htmlFor="quote-companyName" className="form-label">
              Company Name <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="quote-companyName"
              type="text"
              name="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={fieldErrors?.companyName ? 'border-[var(--color-error)]' : ''}
            />
            {fieldErrors?.companyName && (
              <p className="form-error-text">{fieldErrors.companyName}</p>
            )}
          </div>

          <div>
            <label htmlFor="quote-workEmail" className="form-label">
              Work Email <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="quote-workEmail"
              name="workEmail"
              type="email"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              className={fieldErrors?.workEmail ? 'border-[var(--color-error)]' : ''}
            />
            {fieldErrors?.workEmail && <p className="form-error-text">{fieldErrors.workEmail}</p>}
          </div>

          <div>
            <label htmlFor="quote-phone" className="form-label">
              Phone (optional)
            </label>
            <input
              id="quote-phone"
              type="text"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="quote-budgetRange" className="form-label">
                Budget Range
              </label>
              <select
                id="quote-budgetRange"
                name="budgetRange"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
              >
                <option value="">Select budget range</option>
                <option value="under-5k">Under $5,000</option>
                <option value="5k-15k">$5,000 - $15,000</option>
                <option value="15k-50k">$15,000 - $50,000</option>
                <option value="50k-plus">$50,000+</option>
              </select>
            </div>
            <div>
              <label htmlFor="quote-campaignGoal" className="form-label">
                Campaign Goal
              </label>
              <input
                id="quote-campaignGoal"
                type="text"
                name="campaignGoal"
                placeholder="Awareness, leads..."
                value={campaignGoal}
                onChange={(e) => setCampaignGoal(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="quote-timelineStart" className="form-label">
                Timeline Start
              </label>
              <input
                id="quote-timelineStart"
                name="timelineStart"
                type="date"
                value={timelineStart}
                onChange={(e) => setTimelineStart(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="quote-timelineEnd" className="form-label">
                Timeline End
              </label>
              <input
                id="quote-timelineEnd"
                name="timelineEnd"
                type="date"
                value={timelineEnd}
                onChange={(e) => setTimelineEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="quote-companyWebsite" className="form-label">
                Company Website
              </label>
              <input
                id="quote-companyWebsite"
                type="text"
                name="companyWebsite"
                placeholder="https://example.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="quote-legalEntityName" className="form-label">
                Legal Entity Name
              </label>
              <input
                id="quote-legalEntityName"
                type="text"
                name="legalEntityName"
                placeholder="Example LLC"
                value={legalEntityName}
                onChange={(e) => setLegalEntityName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="quote-specialRequirements" className="form-label">
              Special Requirements <span className="text-[var(--color-error)]">*</span>
            </label>
            <textarea
              id="quote-specialRequirements"
              name="specialRequirements"
              rows={4}
              placeholder="Share campaign context, reporting needs, placement constraints, and compliance considerations."
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              className={fieldErrors?.specialRequirements ? 'border-[var(--color-error)]' : ''}
            />
            {fieldErrors?.specialRequirements && (
              <p className="form-error-text">{fieldErrors.specialRequirements}</p>
            )}
          </div>

          <label className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              name="complianceAcknowledgement"
              checked={complianceAcknowledgement}
              onChange={(e) => setComplianceAcknowledgement(e.target.checked)}
              className="mt-1"
            />
            I acknowledge sponsored content may require disclosure and brand-safety review.
          </label>

          <div className="flex gap-3 pt-2">
            <SubmitButton
              pendingText="Submitting..."
              className="btn btn-primary btn-md flex-1 cursor-pointer justify-center"
            >
              Submit Quote Request
            </SubmitButton>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-md cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
