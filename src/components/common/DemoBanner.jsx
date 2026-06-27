import useSettings from "../../hooks/useSettings"
import Settings from "../../pages/admin/Settings"
export default function DemoBanner() {
    const { settings } = useSettings()
    const whatsapp = settings?.whatsapp_number || ''
    const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '').replace(/^0/, '234')}?text=Hi Innovators Hub, I saw the MarketMate demo and I am interested in getting an online store for my business.` : null

    return (
        <div className="bg-blue-600 text-white text-center py-2.5 px-4
                      text-sm font-medium sticky top-0 z-[200]">
            <span className="opacity-90">
                🛍️ This is a <strong>live demo</strong> of what your
                business store could look like online.
            </span>
            {' '}

            {(whatsappLink && <a href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold hover:text-blue-200 transition-colors ml-1">
            Want one for your business? Contact us →
        </a>)}
      </div >
    )
  }