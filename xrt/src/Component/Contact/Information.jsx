import { Mail, MapPinned, PhoneCall } from "lucide-react";
import React from "react";
import { useSiteSettingsQuery } from "../../api";

export default function Information() {
  const { data: settings } = useSiteSettingsQuery();
  const contactDetails = settings?.contactDetails;
  const schedule = settings?.operating_hours?.schedule;

  return (
    <>
      <div className="text-center flex flex-col items-center justify-center py-8">
        <h3 className="text-[30px] font-bold text-[#2F3E30]">
          Keep in touch with us
        </h3>
        <p className="w-[700px] text-[#656766]">
          {settings?.siteSubtitle || 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Expedita quaerat unde quam dolor culpa veritatis inventore, aut commodi eum veniam vel'}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-x-[200px] px-[200px] py-[50px]">
        <div className="relative">
          <MapPinned
            strokeWidth={0.5}
            size={50}
            className="absolute left-[-60px] text-[#5D9063]"
          />
          <h3 className="font-bold text-[#2F3E30] text-[20px]">Address</h3>
          <p className="text-[#656766] w-[250px] py-2">
            {[
              contactDetails?.location?.street_address,
              contactDetails?.location?.city,
              contactDetails?.location?.state
            ].filter(Boolean).join(", ")}
          </p>
        </div>

        <div className="relative">
          <PhoneCall
            strokeWidth={0.5}
            size={50}
            className="absolute left-[-60px] text-[#5D9063]"
          />
          <h3 className="font-bold text-[#2F3E30] text-[20px]">Contact</h3>
          <p className="text-[#656766] w-[250px] py-2">
            Mobile : <span className="font-bold">{contactDetails?.contact}</span>
            <br />
            {/* Hotline can be added if available in settings, otherwise hidden or using a second contact */}
             
            <br />
            E-mail : <a href={`mailto:${contactDetails?.emailAddress}`} className="font-[500] text-[#528959]">{contactDetails?.emailAddress}</a>
          </p>
        </div>

        <div className="relative">
          <Mail
            strokeWidth={0.5}
            size={50}
            className="absolute left-[-60px] text-[#5D9063]"
          />
          <h3 className="font-bold text-[#2F3E30] text-[20px]">Hour of operation</h3>
          <div className="text-[#656766] w-[250px] py-2">
            {(() => {
              if (!schedule) return null;

              const checkIsOpen = () => {
                const now = new Date();
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const currentDay = days[now.getDay()];
                const currentHours = now.getHours().toString().padStart(2, '0');
                const currentMinutes = now.getMinutes().toString().padStart(2, '0');
                const currentTime = `${currentHours}:${currentMinutes}`;

                const todaySchedule = schedule.find(s => s.day === currentDay);

                if (!todaySchedule || todaySchedule.is_closed) return false;
                return currentTime >= todaySchedule.open_time && currentTime <= todaySchedule.close_time;
              };

              const isOpen = checkIsOpen();

              return (
                 <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isOpen ? 'bg-[#5C9963]' : 'bg-red-500'}`}></span>
                    <span className={`font-bold text-[17px] ${isOpen ? 'text-[#5C9963]' : 'text-red-500'}`}>
                      {isOpen ? 'Open Now' : 'Closed'}
                    </span>
                 </div>
              );
            })()}
          </div>
        </div>
      </div>
    </>
  );
}
