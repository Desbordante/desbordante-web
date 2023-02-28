import { MFDCluster, MFDHighlight } from "./DependencyFilters/CompactData";
import { Pagination } from "../../util/index";
import { applyPagination } from "../../util";

type SortFunction = (a: MFDHighlight, b: MFDHighlight) => number;

export class MFDHighlightsFilter {
    public constructor(
        protected cluster: MFDCluster
    ) {}

    public getFilteredClusterHighlights = (pagination: Pagination, sortBy: string, orderBy: string): MFDCluster => {
        const sortFunction = this.getSortFunction(sortBy, orderBy);
        let highlights = this.cluster.highlights;
        if (sortFunction != null) {
            highlights.sort(sortFunction);
        }
        highlights = applyPagination(highlights, pagination, 500);

        return {
            value: this.cluster.value,
            highlightsTotalCount: this.cluster.highlightsTotalCount,
            highlights: highlights,
        };
    };

    getSortFunction(sortBy: string, orderBy: string): SortFunction | null {
        const sortValue = orderBy === "ASC" ? 1 : -1;

        switch (sortBy) {
            case "POINT_INDEX": {
                return (a, b) => sortValue * (a.index - b.index);
            }
            case "FURTHEST_POINT_INDEX": {
                return (a, b) => sortValue * (a.furthestPointIndex - b.furthestPointIndex);
            }
            case "MAXIMUM_DISTANCE": {
                return (a, b) => sortValue * (a.maximumDistance - b.maximumDistance);
            }
            default: {
                return null;
            }
        }
    }
}
