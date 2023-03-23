import { Company, Recommendation } from './index.js';

type BasicInfo = {
  url: URL;
  avatar: URL;
  name: string;
  headline: string;
};

export declare type Recommender = BasicInfo;

export declare type Person = BasicInfo & {
  cover?: URL;
  currentCompany?: Company;
  about?: string;
  city?: string;
  followers?: number;
  educationsDetails?: Company;
  recommendations?: Recommendation;
  givenRecommendations?: Recommendation;
  timestamp: number;
};
