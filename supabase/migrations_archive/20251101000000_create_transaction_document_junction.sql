-- Create junction table to link BSI transactions with document files

-- 1. Create the junction table
CREATE TABLE public.bsi_transaction_document_files (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    document_file_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) 
        REFERENCES bsi_transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_file FOREIGN KEY (document_file_id) 
        REFERENCES document_files(id) ON DELETE CASCADE,
    CONSTRAINT unique_transaction_document UNIQUE (transaction_id, document_file_id)
);

-- 2. Create indexes for performance
CREATE INDEX idx_bsi_transaction_document_files_transaction_id 
    ON bsi_transaction_document_files(transaction_id);
CREATE INDEX idx_bsi_transaction_document_files_document_file_id 
    ON bsi_transaction_document_files(document_file_id);

-- 3. Enable RLS
ALTER TABLE bsi_transaction_document_files ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for the junction table
CREATE POLICY "Users can view documents for their transactions"
ON bsi_transaction_document_files FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM bsi_transactions t
        JOIN bsi_transactions_investors ti ON t.id = ti.transaction_id
        WHERE t.id = bsi_transaction_document_files.transaction_id
        AND ti.investor_id IN (
            SELECT id FROM auth_clerk_users 
            WHERE clerk_user_id = auth.uid()::text
        )
    )
    OR
    EXISTS (
        SELECT 1 FROM auth_clerk_users 
        WHERE clerk_user_id = auth.uid()::text 
        AND role = 'admin'
    )
);

CREATE POLICY "Users can link documents to their transactions"
ON bsi_transaction_document_files FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM bsi_transactions t
        JOIN bsi_transactions_investors ti ON t.id = ti.transaction_id
        WHERE t.id = transaction_id
        AND ti.investor_id IN (
            SELECT id FROM auth_clerk_users 
            WHERE clerk_user_id = auth.uid()::text
        )
    )
    OR
    EXISTS (
        SELECT 1 FROM auth_clerk_users 
        WHERE clerk_user_id = auth.uid()::text 
        AND role = 'admin'
    )
);

CREATE POLICY "Users can unlink their documents"
ON bsi_transaction_document_files FOR DELETE
USING (
    EXISTS (
        SELECT 1 
        FROM document_files df
        WHERE df.id = document_file_id
        AND df.uploaded_by = auth.uid()::text
    )
    OR
    EXISTS (
        SELECT 1 FROM auth_clerk_users 
        WHERE clerk_user_id = auth.uid()::text 
        AND role = 'admin'
    )
);

-- 5. Drop the separate bsi_transaction_documents table if it exists
DROP TABLE IF EXISTS bsi_transaction_documents CASCADE;

-- 6. Add a helper view for easier querying
CREATE OR REPLACE VIEW transaction_documents_view AS
SELECT 
    tdf.transaction_id,
    tdf.id as junction_id,
    df.*
FROM bsi_transaction_document_files tdf
JOIN document_files df ON tdf.document_file_id = df.id;

-- Grant permissions on the view
GRANT SELECT ON transaction_documents_view TO authenticated;

COMMENT ON TABLE bsi_transaction_document_files IS 'Junction table linking BSI transactions to document files';
COMMENT ON VIEW transaction_documents_view IS 'View joining transaction documents with file details for easier querying';
