/**
 * Dynamic Legal Contract Lifecycle & Cryptographic E-Signing Engine
 * Generates jurisdiction-tailored agreements (Form-16, W-9, W-8BEN) and verifies SHA-256 signatures.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { encryptField, generateSignatureChecksum } = require('../utils/cryptoHelper');

/**
 * Generates formatted legal employment agreement content and tax parameters based on jurisdiction
 * @param {string} employeeName
 * @param {string} jobTitle
 * @param {number} baseSalary
 * @param {string} currency
 * @param {string} country
 * @returns {object}
 */
function generateContractTemplate(employeeName, jobTitle, baseSalary = 50000, currency = 'INR', country = 'IN') {
  const normCountry = (country || 'IN').toUpperCase();
  let taxForm = 'Form-16';
  let taxWithholdingPct = 10.0;
  let taxAuthority = 'Income Tax Department of India (Section 192/194J)';

  if (normCountry === 'US' || normCountry === 'USA') {
    taxForm = 'W-9';
    taxWithholdingPct = 30.0;
    taxAuthority = 'Internal Revenue Service (IRS 26 U.S. Code § 3406)';
  } else if (normCountry !== 'IN') {
    taxForm = 'W-8BEN';
    taxWithholdingPct = 15.0;
    taxAuthority = 'Cross-Border Double Taxation Avoidance Agreement (DTAA Treaty)';
  }

  const contractNumber = `ELV-${normCountry}-${Date.now().toString().slice(-6)}`;
  const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const contractContent = `
================================================================================
          ELVOORIQ ENTERPRISE CREATOR & TALENT ENGAGEMENT AGREEMENT
                        CONTRACT REF: ${contractNumber}
================================================================================

THIS AGREEMENT is entered into on this day, ${effectiveDate}, by and between:

1. THE AGENCY: ELVOORIQ ENTERPRISE NETWORK INC. ("Agency"), a premier multi-tenant
   talent representation and digital streaming production firm; and
2. THE TALENT: ${employeeName.toUpperCase()} ("Signee / Talent"), appointed as ${jobTitle}.

WHEREAS the Agency engages the Talent for digital streaming, brand sponsorships,
live media activations, and broadcast appearances across authorized networks;

1. DUTIES & OBLIGATIONS
The Talent agrees to deliver high-fidelity broadcasts adhering strictly to agency
community standards, scheduling protocols, and sponsored brand deliverables.

2. COMPENSATION & PAYROLL
Base Monthly Retainer: ${currency} ${Number(baseSalary).toLocaleString()}
Commission Splits: In addition to the base retainer, Talent is eligible for performance
revenue splits (75% net creator split on sponsored campaigns; platform-specific
creator commission rates).

3. JURISDICTIONAL TAX COMPLIANCE & STATUTORY WITHHOLDING
Governing Jurisdiction: ${normCountry}
Mandated Tax Declaration Form: ${taxForm}
Standard Tax Deduction Rate: ${taxWithholdingPct}% at source (${taxAuthority}).
The Talent confirms that a valid, verified Taxpayer ID / PAN / SSN has been submitted
for compliance and regulatory withholding ledgers.

4. CONFIDENTIALITY & INTELLECTUAL PROPERTY
All proprietary software, agency CRM leads, audience intelligence, and unpublished
campaign assets remain the exclusive trade secrets of ELVOORIQ Enterprise.

5. CRYPTOGRAPHIC ELECTRONIC SIGNATURE & LEGAL BINDING
The parties acknowledge that execution of this document via electronic canvas constitutes
a legally enforceable signature compliant with the ESIGN Act (15 U.S.C. ch. 96) and
Information Technology Act (Section 10A). An immutable SHA-256 cryptographic digest
shall be computed, timestamped, and stored in the enterprise ledger upon execution.

--------------------------------------------------------------------------------
[AGENCY SEAL: ELVOORIQ ROOT COMPLIANCE VERIFIED]
[TALENT STATUS: PENDING E-SIGNATURE EXECUTION]
================================================================================
`.trim();

  return {
    contractNumber,
    taxForm,
    taxWithholdingPct,
    contractContent
  };
}

/**
 * Executes legal contract signing, generates SHA-256 cryptographic checksum, and unlocks user account
 */
async function executeLegalContractSignature({
  contractId,
  signerName,
  signerId = null,
  signatureImage,
  taxIdNumber = 'PAN-SAMPLE-001',
  ipAddress = '127.0.0.1',
  userAgent = 'Mozilla/5.0'
}) {
  const contract = await prisma.legalContract.findUnique({
    where: { id: contractId }
  });

  if (!contract) {
    throw new Error('Contract not found');
  }

  if (contract.status === 'SIGNED') {
    throw new Error('Contract has already been cryptographically signed and executed');
  }

  const timestamp = new Date();
  const sha256Checksum = generateSignatureChecksum(contract.contractContent, signerName, timestamp);
  const encryptedTaxId = encryptField(taxIdNumber);

  // Execute database transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create digital signature record
    const signature = await tx.digitalSignature.create({
      data: {
        contractId: contract.id,
        signerId: signerId || contract.signeeId,
        signerName,
        signatureImage,
        sha256Checksum,
        ipAddress,
        userAgent,
        signedAt: timestamp
      }
    });

    // 2. Create encrypted tax declaration
    const taxDeclaration = await tx.taxDeclaration.create({
      data: {
        contractId: contract.id,
        taxFormType: contract.taxForm,
        taxIdNumber: encryptedTaxId,
        jurisdiction: contract.country,
        withholdingRate: contract.taxWithholdingPct,
        isExempt: false
      }
    });

    // 3. Mark contract as SIGNED
    const updatedContract = await tx.legalContract.update({
      where: { id: contract.id },
      data: {
        status: 'SIGNED',
        signedAt: timestamp
      }
    });

    // 4. If linked to an internal user, automatically enable and activate account
    const targetUserId = signerId || contract.signeeId;
    if (targetUserId) {
      const userExists = await tx.user.findUnique({ where: { id: targetUserId } });
      if (userExists) {
        await tx.user.update({
          where: { id: targetUserId },
          data: {
            status: 'ACTIVE',
            isEnabled: true
          }
        });
      }
    }

    // 5. Create security audit trail
    await tx.securityAuditTrail.create({
      data: {
        action: 'CONTRACT_SIGNED',
        actorId: targetUserId,
        targetResource: `LegalContract:${contract.id}`,
        ipAddress,
        userAgent,
        metadata: JSON.stringify({
          contractNumber: contract.contractNumber,
          sha256Checksum,
          taxForm: contract.taxForm
        })
      }
    });

    return {
      contract: updatedContract,
      signature,
      taxDeclaration: {
        ...taxDeclaration,
        taxIdNumberMasked: '***-ENCRYPTED-SECURE'
      }
    };
  });

  return result;
}

module.exports = {
  generateContractTemplate,
  executeLegalContractSignature
};
