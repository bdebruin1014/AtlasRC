-- ============================================================================
-- ACCOUNTING AUTOMATION FUNCTIONS AND TRIGGERS
-- ============================================================================
-- This migration adds:
-- 1. Auto-increment entry numbers
-- 2. Auto-update totals on line item changes
-- 3. Auto-update payment status
-- 4. GL posting function
-- 5. Account balance calculation
-- ============================================================================

-- =============================================
-- AUTO-INCREMENT ENTRY NUMBERS
-- =============================================
CREATE OR REPLACE FUNCTION generate_entry_number(p_entity_id UUID, p_prefix TEXT)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_sequence INTEGER;
  v_number TEXT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Get next sequence for this entity and year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(entry_number FROM p_prefix || '-' || v_year || '-(.*)') AS INTEGER)
  ), 0) + 1
  INTO v_sequence
  FROM journal_entries
  WHERE entity_id = p_entity_id
    AND entry_number LIKE p_prefix || '-' || v_year || '-%';

  v_number := p_prefix || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');

  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- AUTO-GENERATE JOURNAL ENTRY NUMBER
-- =============================================
CREATE OR REPLACE FUNCTION set_journal_entry_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_number IS NULL OR NEW.entry_number = '' THEN
    NEW.entry_number := generate_entry_number(NEW.entity_id, 'JE');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_journal_entry_number ON journal_entries;
CREATE TRIGGER trg_journal_entry_number
  BEFORE INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION set_journal_entry_number();

-- =============================================
-- UPDATE JOURNAL ENTRY TOTALS
-- =============================================
CREATE OR REPLACE FUNCTION update_journal_entry_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE journal_entries
  SET
    total_debits = (SELECT COALESCE(SUM(debit_amount), 0) FROM journal_entry_lines WHERE journal_entry_id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id)),
    total_credits = (SELECT COALESCE(SUM(credit_amount), 0) FROM journal_entry_lines WHERE journal_entry_id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_je_totals ON journal_entry_lines;
CREATE TRIGGER trg_update_je_totals
  AFTER INSERT OR UPDATE OR DELETE ON journal_entry_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_entry_totals();

-- =============================================
-- UPDATE BILL TOTALS
-- =============================================
CREATE OR REPLACE FUNCTION update_bill_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bills
  SET
    subtotal = (SELECT COALESCE(SUM(amount), 0) FROM bill_lines WHERE bill_id = COALESCE(NEW.bill_id, OLD.bill_id)),
    total_amount = (SELECT COALESCE(SUM(amount), 0) FROM bill_lines WHERE bill_id = COALESCE(NEW.bill_id, OLD.bill_id)) + COALESCE(tax_amount, 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.bill_id, OLD.bill_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_bill_totals ON bill_lines;
CREATE TRIGGER trg_update_bill_totals
  AFTER INSERT OR UPDATE OR DELETE ON bill_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_bill_totals();

-- =============================================
-- UPDATE INVOICE TOTALS
-- =============================================
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET
    subtotal = (SELECT COALESCE(SUM(amount), 0) FROM invoice_lines WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)),
    total_amount = (SELECT COALESCE(SUM(amount), 0) FROM invoice_lines WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)) + COALESCE(tax_amount, 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invoice_totals ON invoice_lines;
CREATE TRIGGER trg_update_invoice_totals
  AFTER INSERT OR UPDATE OR DELETE ON invoice_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_totals();

-- =============================================
-- UPDATE BILL STATUS ON PAYMENT
-- =============================================
CREATE OR REPLACE FUNCTION update_bill_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_bill_total DECIMAL(15,2);
  v_amount_paid DECIMAL(15,2);
BEGIN
  -- Get bill total and total paid
  SELECT total_amount INTO v_bill_total FROM bills WHERE id = NEW.bill_id;

  SELECT COALESCE(SUM(amount_applied), 0) INTO v_amount_paid
  FROM bill_payment_applications WHERE bill_id = NEW.bill_id;

  -- Update bill
  UPDATE bills
  SET
    amount_paid = v_amount_paid,
    status = CASE
      WHEN v_amount_paid >= v_bill_total THEN 'paid'
      WHEN v_amount_paid > 0 THEN 'partial'
      ELSE 'open'
    END,
    updated_at = NOW()
  WHERE id = NEW.bill_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_bill_on_payment ON bill_payment_applications;
CREATE TRIGGER trg_update_bill_on_payment
  AFTER INSERT OR UPDATE ON bill_payment_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_bill_on_payment();

-- =============================================
-- UPDATE INVOICE STATUS ON PAYMENT
-- =============================================
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_total DECIMAL(15,2);
  v_amount_paid DECIMAL(15,2);
BEGIN
  SELECT total_amount INTO v_invoice_total FROM invoices WHERE id = NEW.invoice_id;

  SELECT COALESCE(SUM(amount_applied), 0) INTO v_amount_paid
  FROM invoice_payment_applications WHERE invoice_id = NEW.invoice_id;

  UPDATE invoices
  SET
    amount_paid = v_amount_paid,
    status = CASE
      WHEN v_amount_paid >= v_invoice_total THEN 'paid'
      WHEN v_amount_paid > 0 THEN 'partial'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invoice_on_payment ON invoice_payment_applications;
CREATE TRIGGER trg_update_invoice_on_payment
  AFTER INSERT OR UPDATE ON invoice_payment_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_on_payment();

-- =============================================
-- POST JOURNAL ENTRY TO GENERAL LEDGER
-- =============================================
CREATE OR REPLACE FUNCTION post_journal_entry_to_gl(p_journal_entry_id UUID)
RETURNS VOID AS $$
DECLARE
  v_entry RECORD;
  v_line RECORD;
BEGIN
  -- Get the journal entry
  SELECT * INTO v_entry FROM journal_entries WHERE id = p_journal_entry_id;

  IF v_entry.status <> 'posted' THEN
    RAISE EXCEPTION 'Journal entry must be posted first';
  END IF;

  -- Delete existing GL entries for this journal entry
  DELETE FROM general_ledger WHERE journal_entry_id = p_journal_entry_id;

  -- Insert GL entries for each line
  FOR v_line IN SELECT * FROM journal_entry_lines WHERE journal_entry_id = p_journal_entry_id
  LOOP
    INSERT INTO general_ledger (
      entity_id, account_id, journal_entry_id, journal_entry_line_id,
      transaction_date, posting_date, description, entry_number,
      debit_amount, credit_amount, fiscal_year, fiscal_month, project_id
    ) VALUES (
      v_entry.entity_id, v_line.account_id, v_entry.id, v_line.id,
      v_entry.entry_date, NOW()::DATE, COALESCE(v_line.description, v_entry.description), v_entry.entry_number,
      v_line.debit_amount, v_line.credit_amount,
      EXTRACT(YEAR FROM v_entry.entry_date), EXTRACT(MONTH FROM v_entry.entry_date),
      COALESCE(v_line.project_id, v_entry.project_id)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- GET ACCOUNT BALANCE
-- =============================================
CREATE OR REPLACE FUNCTION get_account_balance(
  p_entity_id UUID,
  p_account_id UUID,
  p_as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_balance DECIMAL(15,2);
  v_normal_balance TEXT;
BEGIN
  SELECT normal_balance INTO v_normal_balance FROM chart_of_accounts WHERE id = p_account_id;

  SELECT
    CASE
      WHEN v_normal_balance = 'debit' THEN COALESCE(SUM(debit_amount - credit_amount), 0)
      ELSE COALESCE(SUM(credit_amount - debit_amount), 0)
    END
  INTO v_balance
  FROM general_ledger
  WHERE entity_id = p_entity_id
    AND account_id = p_account_id
    AND transaction_date <= p_as_of_date;

  RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql;
