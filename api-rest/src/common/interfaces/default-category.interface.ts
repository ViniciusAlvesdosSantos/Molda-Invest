import { CategoryIcon } from "../enums/category-icons.enum";
import { TransactionType } from "../enums/transaction-type.enum";

export interface DefaultCategory {
  name: string
  icon: CategoryIcon
  type: TransactionType
}

