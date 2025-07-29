"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const BackgroundSprites = () => {
  // Completely disable background sprites to reduce memory usage
  // This component was loading 29 separate PNG images which caused memory issues
  return null;
};

export default BackgroundSprites;
