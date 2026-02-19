'use client'

import { useRouter } from 'next/navigation';
import {NewGameModal} from "@/src/app/components/modals/NewGameModal";
import React from "react";
export default function PrivateGamePage() {


  return (
    <div>
      <NewGameModal isPrivate={true}/>
    </div>
  )
}
