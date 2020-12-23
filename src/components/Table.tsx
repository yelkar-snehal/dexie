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
  isSynced: number // treated as number since boolean indexing isn't possible w/ indexed db
}

/**
 * if needed for local data and server data comparison
 * @param arr1
 * @param arr2
 */
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

      // populate store either from local indexed db or server data
      db.table('quantities')
        .toArray()
        .then(quantities => {
          const start = performance.now()
          if (quantities?.length) {
            console.log('using local data for store')
            updateData([...quantities])
          }
          if (!quantities?.length) {
            console.log('using server data for store')
            db.table('quantities')
              .bulkAdd([...list])
              .then(bulk => updateData([...list]))
          }
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

    // timer to sync data periodically with server
    // printing the not synced products for now
    // temp interval of 30s
    useEffect(() => {
      const timer = setInterval(async () => queryDatabase().then((r) => console.log(r)), 30000)
      return () => {
        clearTimeout(timer)
      }
    })

    const queryDatabase = async () => {
      return db.table('quantities').where({ isSynced: 0 }).toArray()
    }

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
        item.isSynced = 0
        updateData([...localData])
        db.table('quantities')
          .update(productId, { quantities: item.quantities, isSynced: 0 })
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
            <TableBody>
              <TableRow key={`head`}>
                <TableCell component="th" scope="row" />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell>Total: {getTotalQuantity(0)}</TableCell>
                <TableCell>Total: {getTotalQuantity(1)}</TableCell>
              </TableRow>
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
