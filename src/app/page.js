"use client";

import Button from "@/UI/Button";
import Card from "@/UI/Card";
import InputGroup from "@/UI/InputGroup";
import SelectGroup from "@/UI/SelectGroup";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="w-96 h-14 bg-white">
        <InputGroup
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          name="email"
        />
      </div>
      <div className="w-96 h-14 bg-white">
        <Button
          text={"submit"}
          onClick={() => {
            alert("Button Clicked");
          }}
        />
      </div>
      <div className="w-96 h-14 bg-white">
        <SelectGroup
          options={["1", "2", "3", "4"]}
          label={"Choose an Integer"}
        />
      </div>
      <div className="w-72 h-72 bg-white">
        <Card />
      </div>
    </div>
  );
}
