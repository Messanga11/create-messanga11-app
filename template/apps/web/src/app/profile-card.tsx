"use client";

import { canPerform, type UiMeta } from "@messanga11/core";
import type { PolicyDenialCode } from "@messanga11/core/policy";
import type { ProfileAction } from "@starter/domain";
import { useState } from "react";

interface ProfileCardProps {
  readonly uiMeta: UiMeta<ProfileAction, PolicyDenialCode>;
}

export function ProfileCard({ uiMeta }: ProfileCardProps) {
  const [message, setMessage] = useState("Prêt à construire.");
  const canEdit = canPerform(uiMeta, "edit");

  return (
    <section aria-labelledby="profile-title" className="card">
      <div>
        <span className="badge">Core connecté</span>
        <h2 id="profile-title">Profil de démonstration</h2>
        <p>Policy revision : {uiMeta.revision}</p>
      </div>
      <button
        disabled={!canEdit}
        onClick={() => setMessage("Action UI reçue. Branche maintenant ton API.")}
        type="button"
      >
        Modifier le profil
      </button>
      <p aria-live="polite" className="status">
        {message}
      </p>
    </section>
  );
}
