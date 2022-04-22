import {useEffect, useState} from 'react';
import * as Sentry from '@sentry/react';

import {loadDocs} from 'sentry/actionCreators/projects';
import {
  PlatformKey,
  withoutPerformanceSupport,
  withPerformanceOnboarding,
} from 'sentry/data/platformCategories';
import platforms from 'sentry/data/platforms';
import {Project} from 'sentry/types';
import useApi from 'sentry/utils/useApi';
import useOrganization from 'sentry/utils/useOrganization';

export function generateOnboardingDocKeys(platform: PlatformKey): string[] {
  return ['1-install', '2-configure', '3-verify'].map(
    key => `${platform}-performance-onboarding-${key}`
  );
}

function usePerformanceOnboardingDocs(project: Project) {
  const organization = useOrganization();
  const api = useApi();

  const [loadingDocs, setLoadingDocs] = useState<Record<string, boolean>>({});
  const [docContents, setDocContents] = useState<Record<string, string>>({});

  const currentPlatform = project.platform
    ? platforms.find(p => p.id === project.platform)
    : undefined;

  const hasPerformanceOnboarding = currentPlatform
    ? withPerformanceOnboarding.has(currentPlatform.id)
    : false;

  const doesNotSupportPerformance = currentPlatform
    ? withoutPerformanceSupport.has(currentPlatform.id)
    : false;

  useEffect(() => {
    if (!currentPlatform || !hasPerformanceOnboarding || doesNotSupportPerformance) {
      setLoadingDocs({});
      setDocContents({});
    }
  }, [currentPlatform, hasPerformanceOnboarding, doesNotSupportPerformance]);

  if (!currentPlatform || !hasPerformanceOnboarding || doesNotSupportPerformance) {
    return {
      isLoading: false,
      hasOnboardingContents: false,
      docContents: {},
    };
  }

  const docKeys = generateOnboardingDocKeys(currentPlatform.id);
  docKeys.forEach(docKey => {
    const setLoadingDoc = (loadingState: boolean) =>
      setLoadingDocs(prevState => {
        return {
          ...prevState,
          [docKey]: loadingState,
        };
      });

    const setDocContent = (docContent: string | undefined) =>
      setDocContents(prevState => {
        if (docContent === undefined) {
          const newState = {
            ...prevState,
          };
          delete newState[docKey];
          return newState;
        }
        return {
          ...prevState,
          [docKey]: docContent,
        };
      });

    loadDocs(api, organization.slug, project.slug, docKey as any)
      .then(({html}) => {
        setDocContent(html as string);
        setLoadingDoc(false);
      })
      .catch(error => {
        Sentry.captureException(error);
        setDocContent(undefined);
        setLoadingDoc(false);
      });
  });

  const isLoading = docKeys.some(key => {
    if (key in loadingDocs) {
      return !!loadingDocs[key];
    }
    return true;
  });

  const hasOnboardingContents = docKeys.every(
    key => typeof docContents[key] === 'string'
  );

  return {
    isLoading,
    hasOnboardingContents,
    docContents,
  };
}

export default usePerformanceOnboardingDocs;
