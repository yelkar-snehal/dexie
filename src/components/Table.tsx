import React, { useEffect } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { useStores } from '../store/TableStore'
import { useObserver } from 'mobx-react-lite'
import { toJS } from 'mobx'
import _ from 'lodash'
import db from '../db'
import { list } from './rowsData'

export interface IList {
  department?: string
  productName: string
  price: string
  productAdjective?: string
  productMaterial?: string
  product?: string
  productDescription?: string
  color?: string
  id: string
  quantities: number[]
  isSynced: boolean
}

const isArrayEqual = (arr1: IList[], arr2: IList[]) => {
  return _(arr1).differenceWith(arr2, _.isEqual).isEmpty()
}

export const CustomTable = () => {
  return useObserver(function CustomTable() {
    // const [data, updateData] = useState<IList[]>([])
    const { tableStore: { getData, updateData, getTotalQuantity, getTotalValue } } = useStores()
    const data = toJS(getData)
    // const request: any = useRef(null)

    useEffect(() => {
      if (!window.indexedDB) {
        console.log('Your browser doesn\'t support a stable version of IndexedDB. Some features will not be available.')
      }

      navigator.serviceWorker.ready.then((r) => {
        if ('periodicSync' in r) {
          console.log('periodicSync supported')
        }
      })

      db.table('quantities')
        .toArray()
        .then(quantities => {
          const start = performance.now()
          if (( !quantities?.length ) || ( quantities?.length && !isArrayEqual(quantities, list) )) {
            db.table('quantities')
              .bulkAdd([...list])
          }
          updateData([...list])
          const finish = performance.now()
          console.log(`Execution time: ${finish - start} milliseconds`)
        })

      // if(window.indexedDB) {
      //   request.current = window.indexedDB.open("TestDatabase", 1);
      //   request.current.onerror = function(event:any) {
      //     console.log("Why didn't you allow my web app to use IndexedDB?!");
      //   };
      //   request.current.onsuccess = function(event:any) {
      //     const db = event.target.result;
      //   };
      // }

      // Then later, request a one-off sync:
      // navigator.serviceWorker.ready.then(function (swRegistration) {
      //   console.log('sw reg', swRegistration)
      //   return swRegistration.sync.register('test')
      // }).catch(e => console.log(e))

    }, [])

    const handleOnChange = (productId: string, value: string, quantityIndex: number, type: string) => {
      const localData: IList[] = [...data]
      const item = localData.find(({ id }) => id === productId)
      if (item) {
        navigator.serviceWorker.ready.then((registration: any) => {
          return registration.active.postMessage('Hi service worker')
        })

        // navigator.serviceWorker.ready.then(function (swRegistration) {
        //   console.log('sw reg')
        //   return swRegistration.sync.register('test')
        // }).catch(e => console.log(e))


        item.quantities[quantityIndex] = Number(value)
        updateData([...localData])
        db.table('quantities')
          .update(productId, { quantities: item.quantities })
      }
    }
    return (
      <div>
        <Paper className="container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Product Id</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Total Values</TableCell>
                {new Array(2).fill(true).map((_v, i) => <TableCell key={i}>{`Quantity ${i + 1}`}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableRow key={`head`}>
              <TableCell component="th" scope="row" />
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell>Total: {getTotalQuantity(0)}</TableCell>
              <TableCell>Total: {getTotalQuantity(1)}</TableCell>
            </TableRow>
            <TableBody>
              {data.map(({ productName, color, id, quantities }, rowIndex) => (
                <TableRow key={`${id}-${rowIndex}`}>
                  <TableCell component="th" scope="row">
                    {productName}
                  </TableCell>
                  <TableCell>{id}</TableCell>
                  <TableCell>{color}</TableCell>
                  <TableCell>{getTotalValue(rowIndex)}</TableCell>
                  {quantities.map((quantity, quantityIndex) =>
                    <TableCell key={`${id}-${rowIndex}-${quantityIndex}`}>
                      <input value={quantity}
                             onChange={(e) =>
                               handleOnChange(id, e.target.value, quantityIndex, `quantity-${quantityIndex}`)} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    )
  })
}
