// src/hooks/useResultsData.ts
import { useEffect, useState } from "react";
import api from "../api";

interface Headquarter {
  id: number;
  name: string;
}

interface Indicator {
  id: number;
  name: string;
  target: string;
  calculationMethod: string;
  measurementUnit: string;
  measurementFrequency: string;
}

interface Result {
  id: number;
  calculatedValue: number;
  year: number;
  month: number;
  quarter: number;
  semester: number;
  headquarters: number;
  indicator: number;
  creationDate: string;
}

interface EnrichedResult {
  id: number;
  calculatedValue: number;
  target: number;
  measurementUnit: string;
  calculationMethod: string;
  measurementFrequency: string;
  indicatorName: string;
  headquarterName: string;
  year: number;
  month: number;
  quarter: number;
}

export const useResultsData = () => {
  const [data, setData] = useState<EnrichedResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resResults, resIndicators, resHeadquarters] = await Promise.all([
          api.get<Result[]>("results/"),
          api.get<Indicator[]>("indicators/"),
          api.get<Headquarter[]>("headquarters/"),
        ]);

        const indicatorsMap = Object.fromEntries(
          resIndicators.data.map((ind) => [ind.id, ind])
        );

        const headquartersMap = Object.fromEntries(
          resHeadquarters.data.map((hq) => [hq.id, hq])
        );

        const enriched = resResults.data.map((result) => {
          const indicator = indicatorsMap[result.indicator];
          const hq = headquartersMap[result.headquarters];
          return {
            ...result,
            target: parseFloat(indicator?.target ?? "0"),
            measurementUnit: indicator?.measurementUnit,
            calculationMethod: indicator?.calculationMethod,
            measurementFrequency: indicator?.measurementFrequency,
            indicatorName: indicator?.name,
            headquarterName: hq?.name,
          };
        });

        setData(enriched);
      } catch (error) {
        console.error("Error cargando los datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { data, loading };
};
