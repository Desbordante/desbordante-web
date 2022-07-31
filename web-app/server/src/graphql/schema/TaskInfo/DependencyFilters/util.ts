import _ from "lodash";

export const compareArrays = <T>(
    lhsArray: T[],
    rhsArray: T[],
    cmp: (lhs: T, rhs: T) => boolean
) => {
    for (let i = 0; i !== Math.min(lhsArray.length, rhsArray.length); ++i) {
        if (cmp(lhsArray[i], rhsArray[i])) {
            return true;
        }
        if (!_.isEqual(lhsArray[i], rhsArray[i])) {
            return false;
        }
    }
    return lhsArray.length < rhsArray.length;
};

export const isIntersects = (lhs: number[], rhs: number[]) => {
    let ai = 0,
        bi = 0;
    while (ai < lhs.length && bi < rhs.length) {
        if (lhs[ai] < rhs[bi]) {
            ai++;
        } else if (lhs[ai] > rhs[bi]) {
            bi++;
        } else {
            return true;
        }
    }
    return false;
};
