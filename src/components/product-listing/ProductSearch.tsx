"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import styles from "./collection.module.css";

export default function ProductSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  if (value !== previousValue) {
    setPreviousValue(value);
    setDraft(value);
  }
  useEffect(() => {
    const timer = setTimeout(() => { if (draft !== value) onChange(draft); }, 350);
    return () => clearTimeout(timer);
  }, [draft, value, onChange]);
  return <div className={styles.search}>
    <Search aria-hidden="true" />
    <input type="search" aria-label="Search jewellery" placeholder="Search jewellery" value={draft} onChange={event => setDraft(event.target.value)} />
    {draft && <button type="button" aria-label="Clear search" onClick={() => { setDraft(""); onChange(""); }}><X aria-hidden="true" /></button>}
  </div>;
}
