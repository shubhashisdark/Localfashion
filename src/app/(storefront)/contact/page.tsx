import type { Metadata } from "next";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { InstagramGlyph } from "@/components/ui/icons";
import { getStoreSettings } from "@/lib/data/store";
import { buildWhatsAppLink } from "@/lib/whatsapp/order-message";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Local Fashion.",
};

export default function ContactPage() {
  const settings = getStoreSettings();
  const whatsappLink = buildWhatsAppLink(
    settings,
    `Hello ${settings.store_name}, I have a question about your products.`
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">Get in touch</p>
      <h1 className="mt-1 font-display text-3xl italic text-ink sm:text-4xl">Contact us</h1>
      <p className="mt-3 max-w-md text-[15px] text-ink-soft">
        Questions about sizing, an order, or anything else — WhatsApp is the
        fastest way to reach us.
      </p>

      <LinkButton href={whatsappLink} variant="whatsapp" size="lg" className="mt-6">
        <MessageCircle size={16} /> Message us on WhatsApp
      </LinkButton>

      <dl className="mt-10 space-y-4 border-t border-line pt-8 text-[14.5px]">
        {settings.phone && (
          <div className="flex items-center gap-3 text-ink-soft">
            <Phone size={16} className="text-ink-faint" /> {settings.phone}
          </div>
        )}
        {settings.email && (
          <div className="flex items-center gap-3 text-ink-soft">
            <Mail size={16} className="text-ink-faint" /> {settings.email}
          </div>
        )}
        {settings.address && (
          <div className="flex items-center gap-3 text-ink-soft">
            <MapPin size={16} className="text-ink-faint" />
            {settings.address}, {settings.city}, {settings.state} {settings.pincode}
          </div>
        )}
        {settings.instagram_url && (
          <div className="flex items-center gap-3 text-ink-soft">
            <InstagramGlyph width={16} height={16} className="text-ink-faint" />
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              @local_fashion_in
            </a>
          </div>
        )}
      </dl>
    </div>
  );
}
