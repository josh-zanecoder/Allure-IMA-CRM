"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type ModalType = "terms" | "privacy";

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
}

export function TermsPrivacyModal({
  isOpen,
  onClose,
  type,
}: TermsPrivacyModalProps) {
  const title = type === "terms" ? "Terms of Service" : "Privacy Policy";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription>
            Allure IMA CRM - Last Updated: May 8, 2024
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 max-h-[calc(80vh-8rem)] pr-4">
          {type === "terms" ? (
            <TermsOfServiceContent />
          ) : (
            <PrivacyPolicyContent />
          )}
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Accept & Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TermsOfServiceContent() {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="font-medium text-base">1. Acceptance of Terms</h3>
      <p>
        By accessing or using Allure IMA CRM ("the Service"), you agree to be
        bound by these Terms of Service. If you do not agree to these terms,
        please do not use the Service.
      </p>

      <h3 className="font-medium text-base">2. Description of Service</h3>
      <p>
        Allure IMA CRM is a customer relationship management platform designed
        to help businesses manage their client interactions, activities, and
        communications.
      </p>

      <h3 className="font-medium text-base">3. User Accounts</h3>
      <p>
        You must create an account to use the Service. You are responsible for
        maintaining the confidentiality of your account information and for all
        activities that occur under your account.
      </p>

      <h3 className="font-medium text-base">4. User Conduct</h3>
      <p>
        You agree to use the Service only for lawful purposes and in a way that
        does not infringe upon the rights of others. You will not use the
        Service to transmit any unlawful, harmful, threatening, abusive,
        harassing, defamatory, or otherwise objectionable material.
      </p>

      <h3 className="font-medium text-base">5. Intellectual Property</h3>
      <p>
        The Service and its original content, features, and functionality are
        owned by Allure IMA and are protected by international copyright,
        trademark, patent, trade secret, and other intellectual property laws.
      </p>

      <h3 className="font-medium text-base">6. Billing and Payment</h3>
      <p>
        Certain aspects of the Service may be provided for a fee. You agree to
        provide accurate billing information and to pay all fees in a timely
        manner. Subscription fees are non-refundable except as required by law.
      </p>

      <h3 className="font-medium text-base">7. Limitation of Liability</h3>
      <p>
        In no event shall Allure IMA, its directors, employees, partners,
        agents, suppliers, or affiliates be liable for any indirect, incidental,
        special, consequential, or punitive damages.
      </p>

      <h3 className="font-medium text-base">8. Termination</h3>
      <p>
        We may terminate or suspend your account and access to the Service
        immediately, without prior notice or liability, for any reason,
        including without limitation if you breach these Terms of Service.
      </p>

      <h3 className="font-medium text-base">9. Changes to Terms</h3>
      <p>
        We reserve the right to modify or replace these Terms at any time. If a
        revision is material, we will try to provide at least 30 days' notice
        prior to any new terms taking effect.
      </p>

      <h3 className="font-medium text-base">10. Governing Law</h3>
      <p>
        These Terms shall be governed by and construed in accordance with the
        laws of the jurisdiction in which Allure IMA operates, without regard to
        its conflict of law provisions.
      </p>

      <h3 className="font-medium text-base">11. Contact Us</h3>
      <p>
        If you have any questions about these Terms, please contact us at
        support@allureima.com.
      </p>
    </div>
  );
}

function PrivacyPolicyContent() {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="font-medium text-base">1. Information We Collect</h3>
      <p>
        We collect information you provide directly to us when you register for
        an account, create or modify your profile, set preferences, or make
        purchases through the Service. This includes your name, email address,
        phone number, billing information, and any other information you choose
        to provide.
      </p>

      <h3 className="font-medium text-base">2. How We Use Information</h3>
      <p>
        We use the information we collect to provide, maintain, and improve our
        Service, process transactions, send communications, respond to
        inquiries, and for other customer service purposes.
      </p>

      <h3 className="font-medium text-base">3. Information Sharing</h3>
      <p>
        We do not share personal information with third parties except as
        described in this policy. We may share information with vendors,
        consultants, and other service providers who need access to such
        information to carry out work on our behalf.
      </p>

      <h3 className="font-medium text-base">4. Data Security</h3>
      <p>
        We take reasonable measures to help protect information about you from
        loss, theft, misuse and unauthorized access, disclosure, alteration and
        destruction. However, no security system is impenetrable and we cannot
        guarantee the security of our systems 100%.
      </p>

      <h3 className="font-medium text-base">5. Your Rights</h3>
      <p>
        You may access, correct, or delete your personal information by logging
        into your account settings. If you wish to delete your account, please
        contact us, but note that we may retain certain information as required
        by law or for legitimate business purposes.
      </p>

      <h3 className="font-medium text-base">
        6. Cookies and Tracking Technologies
      </h3>
      <p>
        We use cookies and similar tracking technologies to track activity on
        our Service and hold certain information. You can instruct your browser
        to refuse all cookies or to indicate when a cookie is being sent.
      </p>

      <h3 className="font-medium text-base">7. Children's Privacy</h3>
      <p>
        Our Service is not directed to children under 13, and we do not
        knowingly collect personal information from children under 13. If we
        learn we have collected personal information from a child under 13, we
        will delete that information.
      </p>

      <h3 className="font-medium text-base">8. International Transfer</h3>
      <p>
        Your information may be transferred to, and maintained on, computers
        located outside of your state, province, country or other governmental
        jurisdiction where the data protection laws may differ.
      </p>

      <h3 className="font-medium text-base">
        9. Changes to This Privacy Policy
      </h3>
      <p>
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page and
        updating the "last updated" date.
      </p>

      <h3 className="font-medium text-base">10. Contact Us</h3>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at privacy@allureima.com.
      </p>
    </div>
  );
}
