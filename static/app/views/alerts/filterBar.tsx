import styled from '@emotion/styled';
import {Location} from 'history';

import ButtonBar from 'sentry/components/buttonBar';
import ProjectPageFilter from 'sentry/components/projectPageFilter';
import SearchBar from 'sentry/components/searchBar';
import {t} from 'sentry/locale';
import space from 'sentry/styles/space';

import TeamFilter from './rules/teamFilter';
import {getQueryStatus, getTeamParams} from './utils';

type Props = {
  location: Location<any>;
  onChangeFilter: (sectionId: string, activeFilters: Set<string>) => void;
  onChangeSearch: (query: string) => void;
  hasStatusFilters?: boolean;
};

function FilterBar({location, onChangeSearch, onChangeFilter, hasStatusFilters}: Props) {
  const selectedTeams = new Set(getTeamParams(location.query.team));

  const selectedStatus = hasStatusFilters
    ? new Set(getQueryStatus(location.query.status))
    : undefined;

  return (
    <Wrapper>
      <FilterButtons gap={1.5}>
        <TeamFilter
          showStatus={hasStatusFilters}
          selectedTeams={selectedTeams}
          selectedStatus={selectedStatus}
          handleChangeFilter={onChangeFilter}
        />
        <ProjectPageFilter />
      </FilterButtons>
      <SearchBar
        placeholder={t('Search by name')}
        query={location.query?.name}
        onSearch={onChangeSearch}
      />
    </Wrapper>
  );
}

export default FilterBar;

const Wrapper = styled('div')`
  display: grid;
  gap: ${space(1.5)};
  margin-bottom: ${space(2)};

  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    grid-template-columns: min-content 1fr;
  }
`;

const FilterButtons = styled(ButtonBar)`
  @media (max-width: ${p => p.theme.breakpoints[0]}) {
    display: flex;
    align-items: flex-start;
    gap: ${space(1.5)};
  }

  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    display: grid;
    grid-auto-columns: minmax(auto, 300px);
  }
`;
