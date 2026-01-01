import BackgroundInformation from "./steps/BackgroundInformation";
import BirthHistory from "./steps/BirthHistory";
import ClientInformation from "./steps/ClientInformation";
import ClinicalObservations from "./steps/ClinicalObservations";
import Domains from "./steps/Domains";
import FeedingAndSensory from "./steps/FeedingAndSensory";
import Summary from "./steps/Summary";

export const reportSteps = [
  { key: "clientInformation", title: "Client Information", component: ClientInformation },
  { key: "birthHistory", title: "Birth History", component: BirthHistory },
  { key: "backgroundInformation", title: "Background Information", component: BackgroundInformation },
  { key: "clinicalObservations", title: "Clinical Observations", component: ClinicalObservations },
  { key: "domains", title: "Domains", component: Domains },
  { key: "feedingAndSensory", title: "Feeding and Sensory Screening", component: FeedingAndSensory },
  { key: "summary", title: "Summary", component: Summary },
];