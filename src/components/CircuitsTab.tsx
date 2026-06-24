import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Search, X, Layers, Zap, Gauge, TrendingUp } from 'lucide-react';
import { Race } from '../types';

const TRACK_DETAILS: Record<string, { length: string; laps: number; record: string; capacity: string; corners: number; path: string }> = {
  bahrain: {
    length: '5.412 km',
    laps: 57,
    record: '1:31.447 (P. de la Rosa)',
    capacity: '45,000',
    corners: 15,
    path: 'M 15,35 L 45,15 L 75,15 L 85,45 L 50,55 L 25,40 Z'
  },
  jeddah: {
    length: '6.174 km',
    laps: 50,
    record: '1:30.734 (L. Hamilton)',
    capacity: '40,000',
    corners: 27,
    path: 'M 20,10 L 35,25 L 50,15 L 65,35 L 75,20 L 80,55 L 35,45 Z'
  },
  albert_park: {
    length: '5.278 km',
    laps: 58,
    record: '1:20.260 (C. Leclerc)',
    capacity: '125,000',
    corners: 14,
    path: 'M 15,35 L 30,15 L 70,25 L 85,50 L 55,50 L 30,45 Z'
  },
  suzuka: {
    length: '5.807 km',
    laps: 53,
    record: '1:30.983 (L. Hamilton)',
    capacity: '155,000',
    corners: 18,
    path: 'M 15,35 Q 30,15 50,45 T 85,25 Q 70,55 45,35 Z'
  },
  miami: {
    length: '5.412 km',
    laps: 57,
    record: '1:29.708 (M. Verstappen)',
    capacity: '80,000',
    corners: 19,
    path: 'M 15,20 L 50,15 L 85,35 L 60,50 L 35,40 Z'
  },
  monaco: {
    length: '3.337 km',
    laps: 78,
    record: '1:12.909 (L. Hamilton)',
    capacity: '37,000',
    corners: 19,
    path: 'M 28.58,40.96 L 28.53,39.67 L 28.61,38.26 L 28.65,37.60 L 28.71,37.00 L 28.82,36.15 L 28.97,35.20 L 29.07,34.70 L 29.18,34.17 L 29.39,33.36 L 29.54,32.80 L 29.65,32.41 L 29.80,31.97 L 30.01,31.43 L 30.22,31.05 L 30.65,30.73 L 31.13,30.53 L 31.67,30.43 L 32.44,30.34 L 32.98,30.29 L 33.76,30.22 L 34.29,30.17 L 34.72,30.12 L 35.24,30.05 L 35.98,29.92 L 36.61,29.78 L 37.32,29.61 L 38.34,29.35 L 38.96,29.21 L 40.23,28.88 L 40.89,28.71 L 42.51,28.32 L 44.21,28.10 L 44.91,28.08 L 45.44,27.97 L 46.44,27.73 L 46.98,27.59 L 47.36,27.35 L 48.12,26.97 L 49.11,26.47 L 49.73,26.21 L 50.13,26.05 L 50.92,25.79 L 51.59,25.63 L 52.26,25.49 L 52.92,25.40 L 53.57,25.31 L 54.28,25.23 L 55.12,25.12 L 56.18,24.89 L 57.12,24.53 L 57.59,24.28 L 58.01,23.99 L 58.39,23.68 L 58.79,23.25 L 59.41,22.07 L 59.53,21.68 L 59.56,21.27 L 59.58,20.84 L 59.52,20.29 L 59.40,19.63 L 59.20,19.14 L 58.92,18.56 L 58.66,18.12 L 58.19,17.47 L 57.88,17.10 L 57.42,16.54 L 57.17,16.19 L 56.95,15.78 L 56.80,15.28 L 56.80,14.73 L 56.93,14.20 L 57.26,13.45 L 57.47,13.09 L 57.89,12.48 L 58.54,20.66 L 58.23,12.06 L 58.60,11.64 L 58.88,11.33 L 59.44,10.71 L 60.12,9.85 L 60.49,9.30 L 61.34,8.08 L 61.90,7.32 L 62.16,7.00 L 62.74,6.31 L 63.01,6.00 L 63.30,5.69 L 63.79,5.27 L 64.20,5.15 L 64.79,5.30 L 65.24,5.69 L 65.45,6.15 L 65.56,6.53 L 65.70,7.07 L 65.85,7.57 L 66.10,8.28 L 66.26,8.67 L 66.45,9.07 L 66.66,9.44 L 67.07,10.01 L 67.40,10.32 L 67.79,10.49 L 68.21,10.41 L 68.35,9.98 L 68.24,9.55 L 68.05,9.19 L 67.77,8.83 L 67.30,8.33 L 66.96,7.96 L 66.73,7.58 L 66.64,7.12 L 66.74,6.64 L 67.07,6.21 L 67.50,5.91 L 68.13,5.58 L 68.62,5.38 L 69.18,5.18 L 69.68,5.03 L 70.43,5.00 L 70.82,5.15 L 71.16,5.60 L 71.31,6.00 L 71.42,6.54 L 71.47,7.19 L 71.45,8.01 L 71.41,8.46 L 71.34,9.08 L 71.25,9.90 L 71.20,10.36 L 71.15,10.76 L 71.10,11.27 L 70.99,12.30 L 70.88,13.25 L 70.73,14.09 L 70.54,14.85 L 70.26,15.75 L 69.77,17.11 L 69.52,17.76 L 69.34,18.18 L 69.14,18.68 L 68.87,19.29 L 68.59,19.88 L 68.28,20.47 L 67.52,21.61 L 67.00,22.23 L 66.69,22.53 L 66.29,22.86 L 65.56,23.39 L 65.19,23.64 L 64.34,24.09 L 63.85,24.31 L 63.24,24.60 L 62.59,24.91 L 61.91,25.25 L 60.93,25.75 L 60.16,26.14 L 59.30,26.55 L 58.68,26.85 L 57.93,27.18 L 57.31,27.44 L 56.42,27.78 L 55.71,28.02 L 55.03,28.22 L 54.54,28.34 L 53.37,28.60 L 52.57,28.73 L 51.92,28.81 L 50.69,28.93 L 50.07,29.00 L 49.64,29.06 L 49.06,29.20 L 48.68,29.46 L 48.48,29.82 L 48.28,30.17 L 47.90,30.52 L 47.39,30.66 L 46.99,30.64 L 46.59,30.56 L 46.10,30.44 L 45.57,30.37 L 45.13,30.37 L 44.26,30.49 L 43.61,30.59 L 40.95,30.95 L 40.48,31.01 L 40.03,31.06 L 39.42,31.13 L 38.57,31.22 L 37.84,31.30 L 37.42,31.33 L 36.57,31.39 L 35.77,31.45 L 35.34,31.47 L 34.35,31.63 L 33.87,31.85 L 33.07,32.54 L 32.54,33.24 L 32.23,33.75 L 32.01,34.17 L 31.74,34.85 L 31.54,35.52 L 31.39,36.14 L 31.29,36.86 L 31.21,37.65 L 31.17,38.26 L 31.17,38.73 L 31.29,39.83 L 32.23,41.21 L 32.55,41.74 L 32.74,42.27 L 33.01,43.12 L 33.36,44.42 L 33.51,45.09 L 33.63,45.78 L 33.76,46.70 L 33.83,47.40 L 33.87,47.87 L 33.89,48.42 L 33.86,49.02 L 33.39,49.83 L 33.12,50.15 L 33.02,50.57 L 33.04,51.16 L 33.15,51.82 L 33.29,52.36 L 33.45,52.87 L 33.63,53.34 L 33.85,53.82 L 34.04,54.19 L 34.72,55.22 L 35.04,55.61 L 35.34,55.93 L 35.67,56.25 L 36.09,56.55 L 36.84,56.98 L 37.28,57.20 L 38.00,57.65 L 38.41,58.05 L 38.55,58.43 L 38.52,58.96 L 38.28,59.44 L 37.28,59.89 L 36.87,59.94 L 36.45,59.98 L 35.89,60.00 L 35.49,60.00 L 34.84,59.93 L 34.43,59.84 L 34.04,59.61 L 33.76,59.23 L 33.62,58.81 L 33.50,58.27 L 33.35,57.63 L 33.18,57.18 L 32.90,56.65 L 32.28,55.74 L 31.73,54.89 L 31.48,54.45 L 31.26,53.97 L 31.03,53.42 L 30.80,52.78 L 30.36,51.41 L 30.15,50.67 L 29.98,50.06 L 29.59,48.64 L 29.40,47.94 L 29.23,47.17 L 29.05,46.23 L 28.94,45.55 L 28.81,44.30 L 28.77,43.88 L 28.74,43.47 L 28.67,42.51 Z'
  },
  catalunya: {
    length: '4.657 km',
    laps: 66,
    record: '1:16.330 (M. Verstappen)',
    capacity: '140,000',
    corners: 14,
    path: 'M 65.82,25.54 L 63.95,28.49 L 63.42,29.33 L 62.98,30.02 L 62.51,30.76 L 61.96,31.62 L 61.59,32.21 L 61.07,33.01 L 60.73,33.56 L 60.28,34.27 L 59.57,35.38 L 58.81,36.58 L 58.43,37.17 L 58.08,37.69 L 57.54,38.51 L 56.79,39.64 L 56.14,40.61 L 55.74,41.21 L 55.34,41.81 L 54.64,42.85 L 53.94,43.90 L 53.49,44.57 L 52.99,45.31 L 52.49,46.05 L 51.90,46.94 L 51.24,47.94 L 50.82,48.58 L 49.95,50.05 L 49.56,50.75 L 49.15,51.47 L 48.78,52.13 L 47.82,53.85 L 47.04,55.13 L 46.60,55.75 L 46.21,56.24 L 45.56,56.92 L 45.03,57.35 L 44.34,57.69 L 43.46,57.78 L 42.79,57.63 L 42.21,57.39 L 41.52,57.06 L 40.96,56.84 L 40.18,56.71 L 39.46,56.81 L 38.70,57.10 L 38.16,57.40 L 37.43,57.88 L 36.74,58.38 L 35.60,59.10 L 34.55,59.62 L 33.93,59.79 L 33.20,59.94 L 32.55,60.00 L 31.77,59.89 L 30.88,59.71 L 29.90,59.27 L 29.05,58.67 L 28.44,58.03 L 27.78,56.93 L 27.56,56.38 L 27.38,55.73 L 27.22,54.63 L 27.21,53.38 L 27.31,52.33 L 27.44,51.56 L 27.60,50.77 L 27.77,50.15 L 28.00,49.38 L 28.39,48.46 L 28.86,47.63 L 29.23,47.02 L 29.82,46.21 L 30.38,45.43 L 31.29,43.99 L 31.77,43.18 L 32.35,42.24 L 33.02,41.24 L 33.83,40.06 L 34.26,39.51 L 35.01,38.76 L 35.54,38.40 L 36.26,38.13 L 37.26,38.12 L 38.06,38.40 L 38.67,38.82 L 39.41,39.74 L 39.80,40.59 L 39.97,41.26 L 40.03,41.89 L 39.97,42.87 L 39.69,43.83 L 39.44,44.42 L 39.06,45.01 L 38.58,45.71 L 37.98,46.54 L 37.37,47.37 L 36.87,48.05 L 36.39,48.71 L 35.80,49.53 L 35.30,50.25 L 34.85,51.00 L 34.58,51.59 L 34.38,52.22 L 34.45,53.30 L 34.82,53.84 L 35.38,54.17 L 36.14,54.27 L 36.75,54.17 L 37.48,53.91 L 38.51,53.39 L 39.06,53.09 L 39.87,52.65 L 40.52,52.33 L 41.73,51.81 L 43.01,51.25 L 43.68,50.91 L 44.55,50.35 L 45.23,49.83 L 45.73,49.39 L 46.22,48.89 L 46.92,48.01 L 47.29,47.53 L 47.93,46.59 L 48.45,45.84 L 48.92,45.09 L 49.14,44.53 L 49.25,43.68 L 49.17,42.74 L 48.94,42.15 L 48.27,41.42 L 47.52,40.88 L 46.98,40.43 L 46.56,39.99 L 45.92,39.00 L 45.63,38.37 L 45.27,37.57 L 44.90,36.79 L 44.52,36.00 L 44.17,35.25 L 43.78,34.43 L 43.32,33.46 L 43.06,32.91 L 42.66,31.83 L 42.51,30.29 L 42.56,29.54 L 42.74,28.72 L 43.04,27.85 L 43.32,27.28 L 43.75,26.67 L 44.42,26.07 L 45.41,25.56 L 46.06,25.30 L 46.84,24.99 L 47.44,24.72 L 48.82,24.07 L 49.49,23.76 L 50.08,23.48 L 50.90,23.09 L 52.14,22.50 L 53.03,22.07 L 53.62,21.79 L 54.34,21.42 L 55.31,20.91 L 56.77,20.13 L 57.74,19.61 L 58.72,19.09 L 59.46,18.69 L 60.10,18.35 L 61.05,17.86 L 61.69,17.56 L 62.47,17.22 L 63.26,16.91 L 63.89,16.65 L 64.67,16.30 L 65.31,15.92 L 65.83,15.40 L 65.80,13.54 L 65.21,12.74 L 64.64,12.34 L 64.01,12.13 L 63.30,12.02 L 62.68,12.02 L 61.93,12.13 L 61.24,12.35 L 60.57,12.67 L 59.65,13.27 L 58.81,13.84 L 57.61,14.38 L 56.78,14.55 L 56.11,14.54 L 55.44,14.41 L 54.64,13.80 L 54.28,13.13 L 54.14,12.34 L 54.19,11.74 L 54.40,11.00 L 54.67,10.47 L 55.17,9.79 L 56.06,8.95 L 56.69,8.46 L 57.53,7.80 L 58.04,7.36 L 58.54,6.93 L 59.05,6.51 L 59.78,5.93 L 60.53,5.46 L 61.11,5.21 L 61.76,5.04 L 62.84,5.00 L 63.59,5.12 L 64.37,5.36 L 65.08,5.65 L 65.74,5.99 L 66.63,6.53 L 67.34,6.98 L 68.13,7.48 L 68.78,7.90 L 69.42,8.31 L 70.35,8.94 L 71.08,9.52 L 71.62,10.07 L 72.04,10.59 L 72.40,11.24 L 72.69,12.14 L 72.81,13.06 L 72.77,13.77 L 72.63,14.41 L 72.46,15.00 L 72.16,15.67 L 71.77,16.36 L 71.11,17.40 L 70.62,18.15 L 70.26,18.71 L 69.88,19.29 L 69.49,19.88 L 69.13,20.44 L 68.61,21.24 L 68.26,21.78 L 67.86,22.39 L 67.43,23.05 L 66.96,23.78 L 66.39,24.66 Z'
  },
  red_bull_ring: {
    length: '4.318 km',
    laps: 71,
    record: '1:05.619 (C. Sainz)',
    capacity: '105,000',
    corners: 10,
    path: 'M 15,40 L 15,15 L 45,25 L 75,25 L 85,45 L 45,45 Z'
  },
  silverstone: {
    length: '5.891 km',
    laps: 52,
    record: '1:27.097 (M. Verstappen)',
    capacity: '150,000',
    corners: 18,
    path: 'M 20,20 L 50,15 L 80,25 L 75,45 L 50,50 L 35,40 L 15,35 Z'
  },
  hungaroring: {
    length: '4.381 km',
    laps: 70,
    record: '1:16.627 (L. Hamilton)',
    capacity: '70,000',
    corners: 14,
    path: 'M 15,30 L 45,15 L 75,30 L 75,45 L 45,50 L 25,45 Z'
  },
  spa: {
    length: '7.004 km',
    laps: 44,
    record: '1:46.286 (V. Bottas)',
    capacity: '70,000',
    corners: 19,
    path: 'M 15,15 L 65,25 L 85,45 L 55,55 L 35,40 Z'
  },
  zandvoort: {
    length: '4.259 km',
    laps: 72,
    record: '1:11.097 (L. Hamilton)',
    capacity: '105,000',
    corners: 14,
    path: 'M 15,35 L 45,15 L 75,30 L 65,50 L 35,45 Z'
  },
  monza: {
    length: '5.793 km',
    laps: 53,
    record: '1:21.046 (R. Barrichello)',
    capacity: '113,800',
    corners: 11,
    path: 'M 15,20 L 75,15 L 85,45 L 70,40 L 45,35 Z'
  },
  baku: {
    length: '6.003 km',
    laps: 51,
    record: '1:43.009 (C. Leclerc)',
    capacity: '30,000',
    corners: 20,
    path: 'M 15,15 L 75,15 L 75,45 L 45,45 L 15,35 Z'
  },
  marina_bay: {
    length: '4.940 km',
    laps: 62,
    record: '1:35.867 (L. Hamilton)',
    capacity: '90,000',
    corners: 19,
    path: 'M 15,15 L 75,15 L 80,45 L 45,50 L 20,40 Z'
  },
  americas: {
    length: '5.513 km',
    laps: 56,
    record: '1:36.169 (C. Leclerc)',
    capacity: '120,000',
    corners: 20,
    path: 'M 15,45 L 35,15 L 65,25 L 85,45 L 45,50 Z'
  },
  rodriguez: {
    length: '4.304 km',
    laps: 71,
    record: '1:17.774 (V. Bottas)',
    capacity: '110,000',
    corners: 17,
    path: 'M 15,15 L 75,15 L 85,45 L 45,45 Z'
  },
  interlagos: {
    length: '4.309 km',
    laps: 71,
    record: '1:10.540 (V. Bottas)',
    capacity: '60,000',
    corners: 15,
    path: 'M 15,25 L 45,15 L 75,30 L 65,50 L 35,40 Z'
  },
  vegas: {
    length: '6.201 km',
    laps: 50,
    record: '1:35.490 (O. Piastri)',
    capacity: '100,000',
    corners: 17,
    path: 'M 10,20 L 80,20 L 85,45 L 50,45 L 25,40 Z'
  },
  losail: {
    length: '5.419 km',
    laps: 57,
    record: '1:24.319 (M. Verstappen)',
    capacity: '52,000',
    corners: 16,
    path: 'M 15,15 L 75,25 L 80,45 L 45,45 Z'
  },
  yas_marina: {
    length: '5.281 km',
    laps: 58,
    record: '1:26.103 (M. Verstappen)',
    capacity: '60,000',
    corners: 16,
    path: 'M 15,15 L 75,25 L 85,45 L 45,50 L 25,35 Z'
  },
  shanghai: {
    length: '5.451 km',
    laps: 56,
    record: '1:32.238 (M. Schumacher)',
    capacity: '200,000',
    corners: 16,
    path: 'M 15,35 L 35,15 L 75,20 L 85,50 L 45,45 Z'
  },
  imola: {
    length: '4.909 km',
    laps: 63,
    record: '1:15.484 (L. Hamilton)',
    capacity: '78,000',
    corners: 19,
    path: 'M 15,15 L 65,25 L 85,45 L 35,50 Z'
  },
  algarve: {
    length: '4.653 km',
    laps: 66,
    record: '1:18.750 (L. Hamilton)',
    capacity: '100,000',
    corners: 15,
    path: 'M 15,25 L 55,15 L 85,35 L 55,45 Z'
  },
  villeneuve: {
    length: '4.361 km',
    laps: 70,
    record: '1:13.078 (V. Bottas)',
    capacity: '100,000',
    corners: 14,
    path: 'M 15,15 L 65,15 L 85,35 L 50,50 L 30,35 Z'
  },
  paul_ricard: {
    length: '5.842 km',
    laps: 53,
    record: '1:32.740 (S. Vettel)',
    capacity: '90,000',
    corners: 15,
    path: 'M 15,25 L 45,15 L 85,30 L 75,55 L 35,45 Z'
  },
  nurburgring: {
    length: '5.148 km',
    laps: 60,
    record: '1:28.139 (M. Verstappen)',
    capacity: '150,005',
    corners: 16,
    path: 'M 15,35 L 45,15 L 75,15 L 85,45 L 35,45 Z'
  },
  hockenheimring: {
    length: '4.574 km',
    laps: 67,
    record: '1:13.780 (K. Räikkönen)',
    capacity: '120,000',
    corners: 17,
    path: 'M 15,15 L 75,15 L 85,45 L 35,35 Z'
  },
  sochi: {
    length: '5.848 km',
    laps: 53,
    record: '1:35.761 (L. Hamilton)',
    capacity: '55,000',
    corners: 18,
    path: 'M 15,35 L 45,15 L 75,30 L 85,55 Q 45,45 Z'
  },
  istanbul: {
    length: '5.338 km',
    laps: 58,
    record: '1:24.770 (J. P. Montoya)',
    capacity: '155,000',
    corners: 14,
    path: 'M 15,20 L 75,15 L 85,45 L 55,50 Z'
  },
  sepang: {
    length: '5.543 km',
    laps: 56,
    record: '1:34.080 (S. Vettel)',
    capacity: '130,000',
    corners: 15,
    path: 'M 10,20 L 70,10 L 80,45 L 35,40 Z'
  },
  canada: {
    length: '4.361 km',
    laps: 70,
    record: '1:13.078 (V. Bottas)',
    capacity: '100,000',
    corners: 14,
    path: 'M 15,15 L 65,15 L 85,35 L 50,50 L 30,35 Z'
  },
  singapore: {
    length: '4.940 km',
    laps: 62,
    record: '1:35.867 (L. Hamilton)',
    capacity: '90,000',
    corners: 19,
    path: 'M 15,15 L 75,15 L 80,45 L 45,50 L 20,40 Z'
  },
  austria: {
    length: '4.318 km',
    laps: 71,
    record: '1:05.619 (C. Sainz)',
    capacity: '105,000',
    corners: 10,
    path: 'M 15,40 L 15,15 L 45,25 L 75,25 L 85,45 L 45,45 Z'
  },
  great_britain: {
    length: '5.891 km',
    laps: 52,
    record: '1:27.097 (M. Verstappen)',
    capacity: '150,000',
    corners: 18,
    path: 'M 20,20 L 50,15 L 80,25 L 75,45 L 50,50 L 35,40 L 15,35 Z'
  },
  belgium: {
    length: '7.004 km',
    laps: 44,
    record: '1:46.286 (V. Bottas)',
    capacity: '70,000',
    corners: 19,
    path: 'M 15,15 L 65,25 L 85,45 L 55,55 L 35,40 Z'
  },
  brazil: {
    length: '4.309 km',
    laps: 71,
    record: '1:10.540 (V. Bottas)',
    capacity: '60,000',
    corners: 15,
    path: 'M 15,25 L 45,15 L 75,30 L 65,50 L 35,40 Z'
  },
  mexico: {
    length: '4.304 km',
    laps: 71,
    record: '1:17.774 (V. Bottas)',
    capacity: '110,000',
    corners: 17,
    path: 'M 15,15 L 75,15 L 85,45 L 45,45 Z'
  },
  japan: {
    length: '5.807 km',
    laps: 53,
    record: '1:30.983 (L. Hamilton)',
    capacity: '155,000',
    corners: 18,
    path: 'M 15,35 Q 30,15 50,45 T 85,25 Q 70,55 45,35 Z'
  },
  china: {
    length: '5.451 km',
    laps: 56,
    record: '1:32.238 (M. Schumacher)',
    capacity: '200,000',
    corners: 16,
    path: 'M 15,35 L 35,15 L 75,20 L 85,50 L 45,45 Z'
  },
  qatar: {
    length: '5.419 km',
    laps: 57,
    record: '1:24.319 (M. Verstappen)',
    capacity: '52,000',
    corners: 16,
    path: 'M 15,15 L 75,25 L 80,45 L 45,45 Z'
  },
  uae: {
    length: '5.281 km',
    laps: 58,
    record: '1:26.103 (M. Verstappen)',
    capacity: '60,000',
    corners: 16,
    path: 'M 15,15 L 75,25 L 85,45 L 45,50 L 25,35 Z'
  }
};

interface CircuitsTabProps {
  races: Race[];
  isLoading: boolean;
  season: string;
}

export default function CircuitsTab({ races, isLoading, season }: CircuitsTabProps) {
  if (isLoading) {
    return (
      <div id="circuits-loading" className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400 font-mono tracking-widest">LOADING CIRCUITS...</p>
      </div>
    );
  }

  const getTrackLengthNum = (circuitId: string) => {
    const info = TRACK_DETAILS[circuitId];
    if (!info) return 5.1;
    return parseFloat(info.length) || 5.1;
  };

  const getTrackCornersNum = (circuitId: string) => {
    const info = TRACK_DETAILS[circuitId];
    if (!info) return 15;
    return info.corners;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [lengthFilter, setLengthFilter] = useState<'all' | 'short' | 'long'>('all');
  const [cornersFilter, setCornersFilter] = useState<'all' | 'flowing' | 'technical'>('all');
  const [isInteractiveViewerOpen, setIsInteractiveViewerOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'default' | 'racing' | 'drs' | 'elevation'>('default');
  const pathRef = useRef<SVGPathElement>(null);
  const [carPosition, setCarPosition] = useState({ x: 0, y: 0 });
  const [simStats, setSimStats] = useState({ speed: 120, throttle: 100, brake: 0, gForce: 1.2, gear: 4 });
  const [sortBy, setSortBy] = useState<'round' | 'length' | 'corners' | 'name'>('round');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('bahrain');
  
  useEffect(() => {
    if (!isInteractiveViewerOpen || !pathRef.current) return;
    let animId: number;
    let progress = 0;
    
    const update = () => {
      if (!pathRef.current) return;
      progress = (progress + 0.35) % 100;
      const len = pathRef.current.getTotalLength();
      if (len > 0) {
        const pt = pathRef.current.getPointAtLength((progress / 100) * len);
        setCarPosition({ x: pt.x, y: pt.y });
        
        const sec = progress / 100;
        let speed = 210;
        let throttle = 100;
        let brake = 0;
        let gear = 5;
        if (sec > 0.05 && sec < 0.2) {
          speed = Math.floor(210 + (sec - 0.05) * 600);
          throttle = 100; brake = 0; gear = 7;
        } else if (sec >= 0.2 && sec < 0.35) {
          speed = Math.floor(190 - (sec - 0.2) * 300);
          throttle = 40; brake = 30; gear = 3;
        } else if (sec >= 0.35 && sec < 0.55) {
          speed = Math.max(48, Math.floor(140 - (sec - 0.35) * 450));
          throttle = 10; brake = 90; gear = 1;
        } else if (sec >= 0.55 && sec < 0.72) {
          speed = Math.floor(180 + (sec - 0.55) * 670);
          throttle = 100; brake = 0; gear = 8;
        } else if (sec >= 0.72 && sec < 0.88) {
          speed = Math.floor(220 - (sec - 0.72) * 350);
          throttle = 50; brake = 40; gear = 4;
        } else {
          speed = Math.max(65, Math.floor(160 - (sec - 0.88) * 800));
          throttle = 20; brake = 75; gear = 2;
        }
        const gForce = (0.6 + Math.random() * 0.3 + (speed > 160 ? (speed / 130) * 1.8 : 0.8)).toFixed(1);
        setSimStats({ speed, throttle, brake, gForce: parseFloat(gForce), gear });
      }
      animId = requestAnimationFrame(update);
    };
    
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isInteractiveViewerOpen, selectedCircuitId, activeLayer]);

  // Map F1 country codes/countries to flags
  const getCountryEmoji = (countryName: string) => {
    if (!countryName) return "🏁";
    const dict: Record<string, string> = {
      "bahrain": "🇧🇭", "saudi arabia": "🇸🇦", "australia": "🇦🇺", "japan": "🇯🇵",
      "usa": "🇺🇸", "united states": "🇺🇸", "monaco": "🇲🇨", "spain": "🇪🇸",
      "austria": "🇦🇹", "uk": "🇬🇧", "great britain": "🇬🇧", "united kingdom": "🇬🇧",
      "hungary": "🇭🇺", "belgium": "🇧🇪", "netherlands": "🇳🇱", "italy": "🇮🇹",
      "azerbaijan": "🇦🇿", "singapore": "🇸🇬", "mexico": "🇲🇽", "brazil": "🇧🇷",
      "qatar": "🇶🇦", "uae": "🇦🇪", "abu dhabi": "🇦🇪", "china": "🇨🇳", "canada": "🇨🇦"
    };
    const key = countryName.toLowerCase().trim();
    return dict[key] || "🏁";
  };

  // Cultural historic fact snippets
  const getCircuitStory = (id: string, name: string) => {
    const stories: Record<string, string> = {
      bahrain: "Sakhir desert oasis. A race of intense cooling challenges, sunset twilight shifts, and violent windblown sand blowing across long straights.",
      jeddah: "The fastest street circuit on the calendar. An intimidating maze of ultra-high-speed sweeps flanked closely by unforgiving concrete barriers.",
      albert_park: "Melbourne semi-permanent public park. High speed, dusty track surfaces on Friday that continuously rubber-in as the weekend matures.",
      suzuka: "The legendary crossover figure-8 layout. Universally adored by drivers for high-G technical combinations through the S-Curves and 130R.",
      miami: "Constructed around Hard Rock Stadium. Featuring a tight, tricky slow-speed marina chicane juxtaposed against 320+ km/h straightaways.",
      monaco: "The ultimate jewel of glamour and absolute precision. A historic harbor-side tightrope where overtaking is near-impossible and grid position is supreme.",
      catalunya: "The ultimate F1 aerodynamic test bed. Long high-speed main stretch paired with high-downforce sweeps that test tyre wear to the absolute limits.",
      red_bull_ring: "Set deep in the Austrian alpine hills. A short, explosive track of dramatic elevation rises, massive braking drops, and critical kerb usage.",
      silverstone: "The birthplace of F1. Renowned for hyper-fast premium fast flows through Copse, Maggotts, and Becketts where aero load is put to its maximum limit.",
      hungaroring: "Monaco without a harbor. A tight, hot, continuous succession of dusty winding curves that leave absolutely zero rest time for the athletes.",
      spa: "Deep in the epic Ardennes forests. Majestic elevation shifts characterized by Eau Rouge and Raidillon, where chaotic micro-climates prompt rain on one side of the track while the other dries.",
      zandvoort: "Winding coastal sand dunes. A historic roller-coaster famous for radical 18-degree steep banked curves, severe cross-winds, and raucous crowd passion.",
      monza: "The Temple of Speed. Teams shear wings down to paper-thin profiles to achieve unmatched, raw straight-line drag reduction on historic Italian soil.",
      baku: "An eccentric paradox. Merges a sprawling multi-mile high-speed main straight with a medieval old castle section barely wider than a modern F1 car.",
      marina_bay: "A brutal physical test. Running at night through high equatorial humidity, bumpy public streets, and over twenty challenging corners.",
      americas: "The magnificent custom-built Austin terrain. Heavily influenced by world-class turn features, starting with a steep uphill blind apex blind turn.",
      rodriguez: "High altitude oxygen deprivation. Raced at 2,200 meters above sea level, resulting in ultra-thin atmosphere, low downforce, and cooling difficulties.",
      interlagos: "Historic counter-clockwise natural theater. Prone to immediate flash downpours, severe bumps, and thrilling overtaking opportunities around Senna S.",
      vegas: "The neon-flooded strip. Freezing asphalt temperatures under nighttime strip lights, demanding immediate thermal control and straight-line efficiency.",
      losail: "High-speed motorcycle sanctuary. High-velocity lateral loads that challenge physical neck muscles, fast continuous sweeping right-left bends.",
      yas_marina: "A majestic twilight finale of grand proportions. Weaving around a luxury yacht harbor and illuminated hotel structures till the checkered flag.",
      shanghai: "Unique snail-shaped layout. Extreme tyre load at the infinite Turn 1-2 loop, which challenges vehicle front-axle traction.",
      imola: "A historic sanctuary of high-commitment kerb hopping. Demands classic old-school focus through Acque Minerali.",
      algarve: "The Portuguese roller-coaster. Massive blind drops and rise peaks that physically lift cars off the ground."
    };
    return stories[id] || `${name} is an active host of the ${season} season. Rich with regional legacy and technical precision.`;
  };

  // Dynamic stamp color generator based on venue location to make passport look authentic and fun
  const getStampColor = (id: string) => {
    const colors: Record<string, string> = {
      monza: "border-emerald-600 text-emerald-600 bg-emerald-50/20",
      vegas: "border-purple-500 text-purple-500 bg-purple-50/20",
      monaco: "border-amber-600 text-amber-600 bg-amber-50/20",
      silverstone: "border-blue-600 text-blue-600 bg-blue-50/20",
      suzuka: "border-rose-600 text-rose-600 bg-rose-50/20",
      singapore: "border-cyan-600 text-cyan-600 bg-cyan-50/20",
      spa: "border-yellow-600 text-yellow-600 bg-yellow-50/20"
    };
    return colors[id] || "border-red-600 text-red-600 bg-red-50/20";
  };

  // Filter and Sort in useMemo
  const filteredCircuits = useMemo(() => {
    const unique = races.reduce((acc: any[], race) => {
      const exists = acc.some((c) => c.circuitId === race.Circuit.circuitId);
      if (!exists) {
        acc.push({
          ...race.Circuit,
          visitedRound: parseInt(race.round) || 1,
          raceName: race.raceName,
        });
      }
      return acc;
    }, []);

    let result = unique.filter((circuit) => {
      const q = searchQuery.toLowerCase();
      const matchText = `${circuit.circuitName} ${circuit.Location.locality} ${circuit.Location.country} ${circuit.raceName}`.toLowerCase();
      if (q && !matchText.includes(q)) return false;

      const len = getTrackLengthNum(circuit.circuitId);
      if (lengthFilter === 'short' && len >= 5.0) return false;
      if (lengthFilter === 'long' && len < 5.0) return false;

      const corners = getTrackCornersNum(circuit.circuitId);
      if (cornersFilter === 'flowing' && corners >= 15) return false;
      if (cornersFilter === 'technical' && corners < 15) return false;

      return true;
    });

    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'round') {
        comp = a.visitedRound - b.visitedRound;
      } else if (sortBy === 'length') {
        comp = getTrackLengthNum(a.circuitId) - getTrackLengthNum(b.circuitId);
      } else if (sortBy === 'corners') {
        comp = getTrackCornersNum(a.circuitId) - getTrackCornersNum(b.circuitId);
      } else if (sortBy === 'name') {
        comp = a.circuitName.localeCompare(b.circuitName);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [races, searchQuery, lengthFilter, cornersFilter, sortBy, sortOrder]);

  const selectedCircuitData = useMemo(() => {
    const found = filteredCircuits.find(c => c.circuitId === selectedCircuitId);
    if (found) return found;
    return filteredCircuits[0] || null;
  }, [filteredCircuits, selectedCircuitId]);

  const activeTrackInfo = useMemo(() => {
    if (!selectedCircuitData) return null;
    return TRACK_DETAILS[selectedCircuitData.circuitId] || {
      length: '5.10 km',
      laps: 55,
      record: 'N/A',
      capacity: '80,000',
      corners: 16,
      path: 'M 15,15 L 75,25 L 85,45 L 35,50 Z'
    };
  }, [selectedCircuitData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      id="circuits-view"
      className="space-y-6"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-5 gap-3">
        <div className="space-y-1 select-none">
          <span className="text-[10px] font-bold tracking-widest text-[#EF1A2D] font-mono uppercase">
            WORLD TOUR DESTINATIONS
          </span>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 leading-none">
            {season} F1 Circuit Explorer
          </h1>
          <p className="text-xs text-neutral-500 max-w-xl">
            A minimal, elegant map database of the {season} F1 host tracks, complete with historical logs, interactive high-fidelity vector sweeps, and official technical track metrics.
          </p>
        </div>
      </header>

      {/* Main Grid Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT VIEW: MINIMAL TRACK DIRECTORY */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-xs space-y-3">
            
            {/* Minimal search and sort menu */}
            <div className="relative font-mono">
              <input
                type="text"
                placeholder="Search country or track..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-3 py-1.5 bg-neutral-50 text-xs text-neutral-800 placeholder-gray-400 outline-none border border-gray-200 focus:border-red-500 rounded-lg transition-colors font-mono"
              />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono select-none">
              <select
                value={lengthFilter}
                onChange={(e) => setLengthFilter(e.target.value as any)}
                className="bg-neutral-50 border border-gray-200 rounded-md p-1.5 text-neutral-700 outline-none focus:border-red-500"
              >
                <option value="all">All Lengths</option>
                <option value="short">Short (&lt; 5.0km)</option>
                <option value="long">Long (&ge; 5.0km)</option>
              </select>
              <select
                value={cornersFilter}
                onChange={(e) => setCornersFilter(e.target.value as any)}
                className="bg-neutral-50 border border-gray-200 rounded-md p-1.5 text-neutral-700 outline-none focus:border-red-500"
              >
                <option value="all">All Turns</option>
                <option value="flowing">Flowing (&lt; 15 turns)</option>
                <option value="technical">Technical (&ge; 15 turns)</option>
              </select>
            </div>

            {/* Sort Order Button Row */}
            <div className="flex items-center gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 bg-neutral-50 border border-gray-200 rounded-md p-1.5 text-xs text-neutral-700 outline-none focus:border-red-500 font-mono text-[10px]"
              >
                <option value="round">Sort by Round</option>
                <option value="length">Sort by Length</option>
                <option value="corners">Sort by Turn Count</option>
                <option value="name">Sort by Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 px-2.5 bg-neutral-50 border border-gray-200 hover:border-gray-300 text-neutral-500 hover:text-neutral-900 rounded-md transition-colors text-xs font-mono"
                title="Toggle Sorting Direction"
              >
                {sortOrder === 'asc' ? 'ASC' : 'DESC'}
              </button>
            </div>
          </div>

          {/* List display */}
          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-neutral-200">
            {filteredCircuits.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                No matching tracks.
              </div>
            ) : (
              filteredCircuits.map((circuit) => {
                const isSelected = selectedCircuitId === circuit.circuitId;
                const info = TRACK_DETAILS[circuit.circuitId] || { length: '5.10 km', corners: 16 };
                
                return (
                  <div
                    key={circuit.circuitId}
                    onClick={() => setSelectedCircuitId(circuit.circuitId)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none ${
                      isSelected
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                        : "bg-white hover:bg-neutral-50/50 border-gray-150 hover:border-gray-250"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wider font-extrabold ${
                            isSelected ? "bg-neutral-800 text-[#EF1A2D]" : "bg-neutral-100 text-neutral-550"
                          }`}>
                            RD {circuit.visitedRound}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold tracking-tight truncate mt-1">
                          {circuit.circuitName}
                        </h4>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {getCountryEmoji(circuit.Location.country)} {circuit.Location.locality}, {circuit.Location.country}
                        </p>
                      </div>
                      <div className="text-right shrink-0 font-mono text-[9px] space-y-0.5 mt-0.5 select-none">
                        <div className="font-bold">{info.length}</div>
                        <div className="text-neutral-400 text-[8px]">{info.corners} curves</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT VIEW: THE PASSPORT TRAVEL VISA */}
        <div className="lg:col-span-8">
          {selectedCircuitData && activeTrackInfo ? (
            <div className="space-y-4">
              
              {/* HIGH TECH GRID DETAILS COMPONENT */}
              <div className="bg-white border border-gray-250 rounded-2xl shadow-sm overflow-hidden relative">
                <div className="bg-neutral-900 h-1.5 w-full" />
                
                <div className="p-6 md:p-8 space-y-6">
                  
                  {/* Top stamp seal header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dashed border-gray-200 pb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCountryEmoji(selectedCircuitData.Location.country)}</span>
                        <span className="text-[9px] font-mono font-bold tracking-widest text-[#EF1A2D] uppercase block">
                          GRAND PRIX SPECIFICATIONS / ROUND {selectedCircuitData.visitedRound}
                        </span>
                      </div>
                      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                        {selectedCircuitData.circuitName}
                      </h2>
                      <p className="text-xs font-mono text-neutral-500">
                        GRID IDENTIFIER: <strong className="text-neutral-800 font-medium">GP-{selectedCircuitData.circuitId.slice(0, 4).toUpperCase()}-{season}</strong>
                      </p>
                    </div>

                    {/* INTERACTIVE LAUNCHER BUTTON */}
                    <button
                      onClick={() => setIsInteractiveViewerOpen(true)}
                      className="px-5 py-2.5 bg-[#EF1A2D] hover:bg-[#d61323] text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer select-none border border-transparent"
                    >
                      <Zap className="w-3.5 h-3.5 animate-pulse" />
                      VIEW INTERACTIVE MAP
                    </button>
                  </div>

                  {/* Grid split inside page of track */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left block: Vector Outline Sheet (Telemetry style) */}
                    <div 
                      onClick={() => setIsInteractiveViewerOpen(true)}
                      className="md:col-span-5 flex flex-col justify-between bg-neutral-950 border border-neutral-850 hover:border-[#EF1A2D]/40 rounded-xl p-5 relative overflow-hidden select-none cursor-pointer group transition-all duration-300 shadow-inner" style={{ minHeight: '260px' }}
                    >
                      {/* Technical scanner lines */}
                      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:12px_12px] opacity-60" />
                      
                      <div className="absolute top-3 left-3 text-[7px] font-mono text-gray-400 flex items-center gap-1.5 z-10 uppercase tracking-widest bg-neutral-900/80 px-1.5 py-0.5 rounded border border-neutral-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>VECTOR GRID: GPS 3D SCALE</span>
                      </div>

                      <div className="absolute bottom-3 right-3 text-[7px] font-mono text-gray-400 z-10 uppercase tracking-widest bg-neutral-900/80 px-1.5 py-0.5 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        🔍 CLICK TO INTERACT
                      </div>
                      
                      {/* SVG Canvas block */}
                      <div className="my-auto py-2 flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-105">
                        <svg 
                          viewBox="0 0 100 65" 
                          className="w-full max-w-[11rem] aspect-[100/65] h-auto drop-shadow-[0_0_8px_rgba(239,26,45,0.15)]"
                        >
                          {/* Outer glow stroke path */}
                          <path
                            d={activeTrackInfo.path}
                            fill="none"
                            stroke="#EF1A2D"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.12"
                          />
                          {/* Solid backing vector line */}
                          <path
                            d={activeTrackInfo.path}
                            fill="none"
                            stroke="#262626"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Inner glowing core line accent */}
                          <motion.path
                            d={activeTrackInfo.path}
                            fill="none"
                            stroke="#EF1A2D"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
                          />
                        </svg>
                      </div>

                      <div className="text-center font-mono text-[7px] text-neutral-500 z-10 uppercase tracking-[0.15em] mt-2">
                        SYSTEM PATH: ACTIVE TELEMETRY TRACING
                      </div>
                    </div>

                    {/* Right block: Specs Stamp Information Details */}
                    <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                      
                      {/* Story log section */}
                      <div className="space-y-2 mt-1">
                        <span className="text-[9px] font-mono font-bold tracking-wider text-gray-400 uppercase">CULTURAL BRIEF & NOTES</span>
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans bg-amber-50/15 p-3.5 rounded-xl border border-amber-900/10 italic">
                          "{getCircuitStory(selectedCircuitData.circuitId, selectedCircuitData.circuitName)}"
                        </p>
                      </div>

                      {/* Technical Specs Layout in a clean minimal grid */}
                      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                        <div className="bg-neutral-50 p-3 rounded-xl border border-gray-150">
                          <span className="text-[8px] text-gray-400 block uppercase font-bold">TOTAL LAP LENGTH</span>
                          <strong className="text-neutral-800 text-xs block mt-0.5">{activeTrackInfo.length}</strong>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-xl border border-gray-150">
                          <span className="text-[8px] text-gray-400 block uppercase font-bold">RACE LAPS</span>
                          <strong className="text-neutral-800 text-xs block mt-0.5">{activeTrackInfo.laps} Laps</strong>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-xl border border-gray-150">
                          <span className="text-[8px] text-gray-400 block uppercase font-bold">TURN COUNT</span>
                          <strong className="text-neutral-800 text-xs block mt-0.5">{activeTrackInfo.corners} Turns</strong>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-xl border border-gray-150">
                          <span className="text-[8px] text-gray-400 block uppercase font-bold">STADIUM CAPACITY</span>
                          <strong className="text-neutral-800 text-xs block mt-0.5">{activeTrackInfo.capacity} Max</strong>
                        </div>
                      </div>

                      {/* Speed Record Display */}
                      <div className="bg-neutral-50 p-3.5 rounded-xl border border-gray-150 flex items-center justify-between gap-2">
                        <div className="font-mono">
                          <span className="text-[8.5px] text-gray-400 block uppercase font-bold">OFFICIAL CIRCUIT RECORD</span>
                          <strong className="text-neutral-850 text-[11px] block mt-0.5">{activeTrackInfo.record.replace(/\s*\(.*?\)/g, '')}</strong>
                        </div>
                        <span className="text-lg" title="Track record master">🏆</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Minimal Travel journal guidelines quote card */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center font-mono text-[10px] text-neutral-550 select-none">
                Select any track venue from the left directory system to focus and fetch technical maps. Click on the track grid to trace laps.
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-white border border-dashed border-gray-200 rounded-3xl font-mono text-gray-400">
              ⚠️ Select a Grand Prix venue on the left track directory list to print active journey metrics.
            </div>
          )}
        </div>

      </div>

      {/* INTERACTIVE ZOOM/SWEEP TELEMETRY MODAL OVERLAY */}
      {isInteractiveViewerOpen && selectedCircuitData && activeTrackInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl relative flex flex-col my-4 md:my-8">
            
            {/* Visual top indicator bar */}
            <div className="h-1 bg-[#EF1A2D] w-full" />
            
            <button 
              onClick={() => setIsInteractiveViewerOpen(false)}
              className="absolute top-4 right-4 p-2 bg-neutral-800/80 hover:bg-[#EF1A2D] text-white rounded-full transition-colors cursor-pointer select-none z-35"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-8 flex-1 flex flex-col space-y-6">
              {/* Header telemetry details */}
              <div className="border-b border-neutral-800 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCountryEmoji(selectedCircuitData.Location.country)}</span>
                    <span className="text-[9.5px] font-mono font-bold tracking-widest text-[#EF1A2D] uppercase block">
                      GRID MATRIX ANALYZER // ACTIVE VECTOR TRACE
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
                    {selectedCircuitData.circuitName}
                  </h2>
                  <p className="text-xs font-mono text-neutral-400">
                    SYSTEM ID: <span className="text-white font-medium">GP-{selectedCircuitData.circuitId.toUpperCase()}-{season}</span>
                    {selectedCircuitData.circuitId === 'monaco' && (
                      <span className="ml-2.5 text-[#EF1A2D] font-bold bg-[#EF1A2D]/10 px-2 py-0.5 rounded border border-[#EF1A2D]/35">
                        ✓ REAL GPS XYZ DATA ACTIVATED (539 COORDINATES)
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400">
                  <span>ACTIVE VECTOR PATH TRACE</span>
                </div>
              </div>

              {/* Dynamic Interactive Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">
                
                {/* Main Giant Vector Box */}
                <div className="lg:col-span-7 bg-black rounded-2xl border border-neutral-800 p-6 flex flex-col justify-between relative overflow-hidden h-[340px] md:h-[400px]">
                  {/* Grid background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] opacity-80" />
                  <div className="absolute top-4 left-4 text-[8px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    <span>LIVE TRACK SWEEP SCANNER</span>
                  </div>

                  {/* Render Map */}
                  <div className="mx-auto my-auto relative flex items-center justify-center">
                    <svg 
                      viewBox="0 0 100 65" 
                      className="w-full max-w-[28rem] aspect-[100/65] h-auto drop-shadow-[0_0_12px_rgba(239,26,45,0.25)]"
                    >
                      {/* SVG path background for contrast */}
                      <path
                        d={activeTrackInfo.path}
                        fill="none"
                        stroke="#171717"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Base reference line */}
                      <path
                        ref={pathRef}
                        id="telemetry-path"
                        d={activeTrackInfo.path}
                        fill="none"
                        stroke="#2d2d2d"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Sliding Sim Racing car indicator representing real physics */}
                      {carPosition.x > 0 && (
                        <g>
                          {/* Glowing outer aura */}
                          <circle 
                            cx={carPosition.x} 
                            cy={carPosition.y} 
                            r="4" 
                            fill="#EF1A2D" 
                            opacity="0.4"
                            className="animate-pulse"
                          />
                          {/* Inner high intensity core */}
                          <circle 
                            cx={carPosition.x} 
                            cy={carPosition.y} 
                            r="2" 
                            fill="#ffffff" 
                            stroke="#EF1A2D"
                            strokeWidth="1.5"
                          />
                        </g>
                      )}
                    </svg>
                  </div>

                  {/* Active sector metrics for Monaco */}
                  <div className="flex justify-between items-center bg-neutral-900/80 px-4 py-2 rounded-xl border border-neutral-850 z-10 font-mono text-[9px] text-neutral-450">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      SECTOR 1 (SPEED)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      SECTOR 2 (HAIRPIN)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      SECTOR 3 (HARBOR)
                    </span>
                  </div>
                </div>

                {/* Telemetry Control Dashboard */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                  
                  {/* Realtime Live Gauges */}
                  <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-4">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400 border-b border-neutral-850 pb-2">
                      <Gauge className="w-3.5 h-3.5 text-[#EF1A2D]" />
                      <span className="tracking-widest uppercase">REAL-TIME LAP METRICS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 font-mono text-center relative">
                        <span className="text-[7.5px] text-neutral-400 uppercase block tracking-wider">SPEED</span>
                        <strong className="text-xl text-white font-extrabold block mt-1">{simStats.speed} <span className="text-[10px] text-neutral-550">KM/H</span></strong>
                        <div className="bg-neutral-800 h-1 w-full rounded-full mt-2 overflow-hidden">
                          <div className="bg-[#EF1A2D] h-full transition-all duration-100" style={{ width: `${(simStats.speed / 340) * 100}%` }} />
                        </div>
                      </div>

                      <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 font-mono text-center">
                        <span className="text-[7.5px] text-neutral-400 uppercase block tracking-wider">LATERAL G-FORCE</span>
                        <strong className="text-xl text-white font-extrabold block mt-1">{simStats.gForce} <span className="text-[10px] text-neutral-550">G</span></strong>
                        <div className="bg-neutral-800 h-1 w-full rounded-full mt-2 overflow-hidden">
                          <div className="bg-amber-400 h-full transition-all duration-100" style={{ width: `${(simStats.gForce / 5.5) * 100}%` }} />
                        </div>
                      </div>

                      <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 font-mono">
                        <div className="flex justify-between text-[7.5px] text-neutral-400 uppercase tracking-wider mb-1">
                          <span>THROTTLE</span>
                          <span>{simStats.throttle}%</span>
                        </div>
                        <div className="bg-neutral-800 h-2 w-full rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full transition-all duration-150" style={{ width: `${simStats.throttle}%` }} />
                        </div>
                      </div>

                      <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 font-mono">
                        <div className="flex justify-between text-[7.5px] text-neutral-400 uppercase tracking-wider mb-1">
                          <span>BRAKING FORCE</span>
                          <span>{simStats.brake}%</span>
                        </div>
                        <div className="bg-neutral-800 h-2 w-full rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full transition-all duration-150" style={{ width: `${simStats.brake}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 flex justify-between items-center font-mono">
                      <span className="text-xs text-neutral-300">SELECTED GEAR</span>
                      <span className="text-2xl text-white font-extrabold leading-none">{simStats.gear || 4} <span className="text-[9px] text-neutral-500 font-bold">GR</span></span>
                    </div>
                  </div>

                  {/* Bottom stats notes */}
                  <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 max-w-full overflow-hidden text-[9px] text-neutral-400 text-center font-mono">
                    Active track path telemetry loaded. Record is {activeTrackInfo.record.replace(/\s*\(.*?\)/g, '')}.
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
