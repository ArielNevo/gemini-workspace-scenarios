import { scenarios, siteConfig, taxonomy } from '../lib/content';
import { makeLabeler, RuleBasedRecommender } from '../lib/recommend/rule-based';

export const labeler = makeLabeler(taxonomy);
export const ruleRecommender = new RuleBasedRecommender(scenarios, siteConfig.recommend, labeler);
