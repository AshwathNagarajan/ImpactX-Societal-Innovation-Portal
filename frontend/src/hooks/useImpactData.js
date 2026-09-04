import { useEffect, useState } from "react";
import { getPublicData } from "../services/dataService.js";
import { categories, districts, priorities, statuses, supportTypes } from "../data/referenceData.js";

const emptyChartData = {
  category: [],
  monthly: [],
  status: [],
  district: [],
  participation: [],
  impact: [],
};

const initialData = {
  challenges: [],
  institutes: [],
  industries: [],
  projects: [],
  teams: [],
  chartData: emptyChartData,
  kpis: [],
  categories,
  districts,
  statuses,
  priorities,
  supportTypes,
};

export function useImpactData() {
  const [state, setState] = useState({ data: initialData, loading: true, error: "" });

  useEffect(() => {
    let active = true;
    getPublicData()
      .then((data) => {
        if (active) setState({ data: { ...initialData, ...data }, loading: false, error: "" });
      })
      .catch((error) => {
        if (active) setState({ data: initialData, loading: false, error: error?.message || "Unable to load database records." });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
