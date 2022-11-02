/*
 * @Description: label model
 * @Author: MADAO
 * @Date: 2022-11-01 19:58:29
 * @LastEditors: MADAO
 * @LastEditTime: 2022-11-01 20:55:28
 */
import type { Label } from '@prisma/client';
import type { Response } from '~/lib/api';

import BaseModel from './index';

import { prisma } from '~/lib/db';

export type CreateLabelParams = {
  userId: number;
  label: string;
};
export type Labels = Array<Label & {
  notes: Array<{
    id: number;
  }>;
}>;
export type LabelResponse = Response<Label>;
export type LabelsResponse = Response<Labels>;

class LabelModel extends BaseModel {
  async create(params: CreateLabelParams) {
    try {
      await this.validator(params, [
        { key: 'label', message: '标签名不能为空', required: true },
      ]);
      return await this.execSql(prisma.label.create({
        data: { name: params.label },
      }));
    } catch (error) {
      return error as Promise<LabelResponse>;
    }
  }

  async index() {
    try {
      return await this.execSql(prisma.label.findMany({
        include: {
          notes: {
            select: { id: true },
          },
        },
      }));
    } catch (error) {
      return error as Promise<LabelsResponse>;
    }
  }
}

export default LabelModel;
