"use client";
// React
import React from "react";

// Nextjs
import dynamic from "next/dynamic";

// 3rd Party

// icons

const iconMap = {
  facebook: dynamic(() => import("react-icons/fa6").then((m) => m.FaFacebookF)),
  twitter: dynamic(() => import("react-icons/fa6").then((m) => m.FaXTwitter)),
  youtube: dynamic(() => import("react-icons/fa6").then((m) => m.FaYoutube)),
  instagram: dynamic(() => import("react-icons/fa6").then((m) => m.FaInstagram)),
  linkedin: dynamic(() => import("react-icons/fa6").then((m) => m.FaLinkedinIn)),
};

//Utils
import { isValidSocialValue, normalizeSocialUrl } from "@/utilities/socialLinks";

// Social icon component
const SocialIcons = ({ facebook, twitter, youtube, instagram, linkedin }) => {
  const icons = [
    { icon: iconMap.facebook, link: facebook, label: "Facebook" },
    { icon: iconMap.twitter, link: twitter, label: "Twitter" },
    { icon: iconMap.youtube, link: youtube, label: "YouTube" },
    { icon: iconMap.instagram, link: instagram, label: "Instagram" },
    { icon: iconMap.linkedin, link: linkedin, label: "LinkedIn" },
  ];

  const filteredIcons = icons.filter((item) => isValidSocialValue(item?.link));

  const handleSocialLinkClick = (link) => {
    const url = normalizeSocialUrl(link);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };


  return (
    <div className="flex cursor-pointer items-center gap-4">
      {filteredIcons?.length > 0 &&
        filteredIcons?.map((item, idx) => (
          <div
            key={idx}
            aria-label={item.label}
            onClick={() => handleSocialLinkClick(item.link)}
            className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-300 text-gray-800 hover:border-[var(--color)] transition-colors duration-300"
          >
            {/* Background fill animation */}
            <span className="absolute top-0 left-0 h-full w-0 bg-[var(--color)] transition-all duration-300 ease-in-out group-hover:w-full"></span>
            {/* Icon */}
            <span className="relative z-10 text-xl transition-colors duration-300 ease-in-out group-hover:text-white">
              <item.icon/>
            </span>
          </div>
        ))}
    </div>
  );
};

export default SocialIcons;
