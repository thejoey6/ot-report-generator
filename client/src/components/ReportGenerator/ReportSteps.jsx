import BackgroundInformation from "./steps/BackgroundInformation";
import BirthHistory from "./steps/BirthHistory";
import ClientInformation from "./steps/ClientInformation";
import ClinicalObservations from "./steps/ClinicalObservations";
import Domains from "./steps/Domains";
import FeedingAndSensory from "./steps/FeedingAndSensory";
import Summary from "./steps/Summary";

export const reportSteps = [
  { key: "clientInformation", title: "Client Information", component: ClientInformation },
  { key: "backgroundInformation", title: "Background Information", component: BackgroundInformation },
  { key: "clinicalObservations", title: "Clinical Observations", component: ClinicalObservations },
  { key: "feedingAndSensory", title: "Feeding and Sensory Screening", component: FeedingAndSensory },
  { key: "birthHistory", title: "Birth History", component: BirthHistory },
  { key: "domains", title: "Domains", component: Domains },
  { key: "summary", title: "Summary", component: Summary },
];