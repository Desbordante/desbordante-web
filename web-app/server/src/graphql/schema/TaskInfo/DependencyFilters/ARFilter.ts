import { ARCompactType, CompactData, ItemsInfo } from "./CompactData";
import { AbstractFilter, ComparatorWithParam, ConditionFunction } from "./AbstractFilter";
import { compareArrays, isIntersects } from "./util";
import { Ar } from "../../../types/types";

export class ARFilter extends AbstractFilter<ARCompactType, Ar> {
    protected toDependency: (dep: ARCompactType) => Ar;
    protected toCompactDep = CompactData.toCompactAR;
    private args: [ItemsInfo];

    public initArgs = async () => {
        this.args = [await AbstractFilter.getItemsInfo(this.state, "AR")];
        this.toDependency = (dep) => CompactData.toAR(dep, ...this.args);
    };

    getConditions = async (): Promise<ConditionFunction<ARCompactType>[]> => {
        const [itemsInfo] = this.args;
        const { filterString } = this.filter;
        const mustContainIndices: number[] = [];
        if (filterString) {
            try {
                itemsInfo.itemValues.forEach(
                    (value, id) =>
                        value.match(new RegExp(filterString, "i")) &&
                        mustContainIndices.push(id)
                );
            } catch (e) {
                this.context.logger("Received incorrect filter string");
            }
        }
        return [
            ({ lhs, rhs }) =>
                !(
                    filterString &&
                    !isIntersects(mustContainIndices, lhs) &&
                    !isIntersects(mustContainIndices, rhs)
                ),
        ];
    };

    public static getItemIndicesOrder = ({ itemValues }: ItemsInfo): number[] => {
        const itemIndicesOrder = [...Array(itemValues.length).keys()];
        itemIndicesOrder.sort((l, r) => (itemValues[l] < itemValues[r] ? -1 : 1));
        return itemIndicesOrder;
    };

    getComparators(): ComparatorWithParam<ARCompactType>[] {
        const [itemsInfo] = this.args;
        const itemIndicesOrder = ARFilter.getItemIndicesOrder(itemsInfo);
        const ARItemComparator = (lhs: number, rhs: number) =>
            itemIndicesOrder[lhs] < itemIndicesOrder[rhs];
        return [
            {
                parameter: "CONF",
                comparator: (lhs, rhs) => lhs.confidence < rhs.confidence,
            },
            {
                parameter: "LHS_NAME",
                comparator: (lhs, rhs) =>
                    compareArrays(lhs.lhs, rhs.lhs, ARItemComparator),
            },
            {
                parameter: "RHS_NAME",
                comparator: (lhs, rhs) =>
                    compareArrays(lhs.rhs, rhs.rhs, ARItemComparator),
            },
        ];
    }
}
