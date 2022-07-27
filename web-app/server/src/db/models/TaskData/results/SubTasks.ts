import { Column, Table } from "sequelize-typescript";
import { INTEGER, TEXT } from "sequelize";
import { BaseSpecificTaskResult } from "./BaseTaskResult";
import { getResultTableOptions } from "../tableOptions";

@Table(getResultTableOptions("TypoCluster"))
export class TypoClusterResult extends BaseSpecificTaskResult {
    @Column({ type: TEXT, allowNull: true })
    TypoClusters!: string | null;

    @Column({ type: TEXT, allowNull: true })
    suspiciousIndices!: string | null;

    @Column({ type: TEXT, allowNull: true })
    clustersCount: number;
}

@Table(getResultTableOptions("SpecificTypoCluster"))
export class SpecificTypoClusterResult extends BaseSpecificTaskResult {
    @Column({ type: TEXT, allowNull: true })
    suspiciousIndices!: string | null;

    @Column({ type: TEXT, allowNull: true })
    squashedNotSortedCluster!: string | null;

    @Column({ type: TEXT, allowNull: true })
    squashedSortedCluster!: string | null;

    @Column({ type: INTEGER, allowNull: true })
    squashedItemsAmount!: number | null;

    @Column({ type: INTEGER, allowNull: true })
    notSquashedItemsAmount!: number | null;

    @Column({ type: TEXT, allowNull: true })
    notSquashedNotSortedCluster!: string | null;

    @Column({ type: TEXT, allowNull: true })
    notSquashedSortedCluster!: string | null;
}
