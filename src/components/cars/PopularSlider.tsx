"use client";

import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import type { CarCardModel } from "@/components/cars/CarCard";
import { CarCard } from "@/components/cars/CarCard";

export function PopularSlider({ cars }: { cars: CarCardModel[] }) {
  return (
    <Swiper
      modules={[Navigation]}
      navigation
      spaceBetween={16}
      slidesPerView={1.05}
      breakpoints={{
        768: { slidesPerView: 2.05 },
        1200: { slidesPerView: 3 },
      }}
    >
      {cars.map((car) => (
        <SwiperSlide key={car.id} className="!h-auto">
          <CarCard car={car} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
