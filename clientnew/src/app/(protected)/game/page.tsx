'use client';
import React from 'react';
import {NewGameModal} from "@/src/app/components/modals/NewGameModal";

function GamePage() {
  return (
    <div>
      <NewGameModal isPrivate={false} />
    </div>
  );
}

export default GamePage;
