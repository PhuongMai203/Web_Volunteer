"use client";

import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import styles from "../../../styles/Home/CampaignList.module.css";
import HeroSection from "./sub/HeroSection";
import SupportForm from "./SupportForm";
import FeaturedCampaigns from "./sub/FeaturedCampaigns";
import SearchBar from "./SearchBar";
import FeaturedFaces from "./sub/FeaturedFaces";
import FeaturedStats from "./sub/FeaturedStats";

const partners = [
  "/images/partner1.jpg",
  "/images/partner2.jpg",
  "/images/partner3.jpg",
];

interface Campaign {
  id: string;
  title: string;
  description: string;
}

export default function CampaignList() {
  const [campaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div data-aos="fade-up">
        <HeroSection />
      </div>

      <FeaturedFaces />
      <FeaturedCampaigns />

      <div data-aos="fade-up">
        <SupportForm />
      </div>

      <FeaturedStats />

      <div className="mb-10 mt-10">
        <div className="mb-12">
          <h1 className="text-2xl font-bold mb-4 text-orange-700" data-aos="fade-right">
            🤝 Các Đối Tác
          </h1>
          <div className="flex gap-6 flex-wrap justify-center">
            {partners.map((src, i) => (
              <div
                key={i}
                className={styles.partnerLogo}
                data-aos="flip-left"
                data-aos-delay={i * 100}
              >
                <Image
                  src={src}
                  alt={`Đối tác ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 200px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {filteredCampaigns.length === 0 && (
        <p className="text-gray-500 text-center mt-10" data-aos="fade-in">
          Không tìm thấy chiến dịch nào.
        </p>
      )}
    </div>
  );
}
