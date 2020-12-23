import { createContext, useContext } from 'react'
import { computed, observable, action, makeObservable } from 'mobx'
import { IList } from '../components/Table'
import { computedFn } from 'mobx-utils'


export class TableStore {
  @observable data: IList[]

  constructor(data: IList[]) {
    makeObservable(this)
    this.data = data
  }

  @computed get getData() {
    return this.data
  }

  @action
  updateData = (data: IList[]) => {
    this.data = data
  }

  getTotalQuantity = computedFn((column: number) => {
    const { data } = this
    return data.map(d => d.quantities[column]).reduce((accumulator: number, colValue: number) => accumulator + colValue, 0)
  }).bind(this)

  getTotalValue = computedFn((row: number) => {
    const { data } = this
    return data[row].quantities.reduce((accumulator: number, rowValue: number) => accumulator + rowValue, 0)
  }).bind(this)
}

export const storesContext = createContext({
  tableStore: new TableStore([]),
})

export const useStores = () => useContext(storesContext)