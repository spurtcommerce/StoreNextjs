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
import { httpRegex } from "@/utilities/helper";

// Social icon component
const SocialIcons = ({ facebook, twitter, youtube, instagram, linkedin }) => {
  const icons = [
    { icon: iconMap.facebook, link: facebook },
    { icon: iconMap.twitter, link: twitter },
    { icon: iconMap.youtube, link: youtube },
    { icon: iconMap.instagram, link: instagram },
    { icon: iconMap.linkedin, link: linkedin },
  ];

  const filteredIcons = icons?.filter(
    (item) => !["", null, "null", undefined, "undefined"].includes(item?.link),
  );

  const handleSocialLinkClick = (link) => {
    if (link !== "") {
      let url = "";
      if (!httpRegex.test(link)) {
        url += "http://";
      }

      url += link;
      window.open(url);
    }
  };


  return (
    <div className="flex cursor-pointer items-center gap-4">
      {filteredIcons?.length > 0 &&
        filteredIcons?.map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleSocialLinkClick(item?.link ?? "#")}
            className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[var(--color-gray-300)] text-[var(--color-gray-800)] hover:border-[var(--color)] transition-colors duration-300"
          >
            {/* Background fill animation */}
            <span className="absolute top-0 left-0 h-full w-0 bg-[var(--color)] transition-all duration-300 ease-in-out group-hover:w-full"></span>
            {/* Icon */}
            <span className="relative z-10 text-xl transition-colors duration-300 ease-in-out group-hover:text-[var(--color-white)]">
              <item.icon/>
            </span>
          </div>
        ))}
    </div>
  );
};

export default SocialIcons;
