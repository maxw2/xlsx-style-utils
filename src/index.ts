import * as XLSX from 'xlsx-js-style'
import type { Range } from 'xlsx-js-style'
/**
 * 
 */
export function json_to_aoa(columns: Columns, data: Data, merge: Array<string>) {
    let array, merges

    console.log('123')

    const [hArray, hMerges] = colJson_to_aoa(columns)
    const [dAarray, dMerges] = data_to_aoa(columns, data, merge)

    array = hArray.concat(dAarray)
    merges = hMerges.concat(dMerges)

    // console.log(hMerges, dMerges, 'mergessadasdas')
    // console.log(array, merges)

    return [array, merges]

}

export function json_to_file(columns: Columns, data: Data, merge: Array<string>) {
    let array, merges


    const [hArray, hMerges] = colJson_to_aoa(columns)
    const [dAarray, dMerges] = data_to_aoa(columns, data, merge)

    array = hArray.concat(dAarray)
    merges = hMerges.concat(dMerges)

    // console.log(hMerges, dMerges, 'mergessadasdas')
    // console.log(array, merges)

    writeFile(array, merges)
}

export function colJson_to_aoa(columns: Columns): [Aoa, Array<Range>] {

    const aoa = createHeadAoa(columns)
    const merges = createHeadMerge(aoa)

    return [aoa, merges]
}

export function data_to_aoa(columns: Columns, data: Data, mergeArr?: Array<string>): [Aoa, Array<Range>] {
    const propsArr = floatProps(columns)
    const rowLen = deepRow(columns)
    let dataArr: Aoa = []
    const mergeMap: any = {}
    let merges: Array<Range> = []

    data.forEach((rowVal, rowIdx) => {
        propsArr.forEach((prop, colIdx) => {
            if (!prop) return
            if (!dataArr[rowIdx]) dataArr[rowIdx] = []
            const value = rowVal[prop]
            dataArr[rowIdx].push(value)

            if (mergeArr && mergeArr.includes(prop)) {
                let map = mergeMap[prop]

                if (map && map.value === value) {
                    map.i++
                    if (rowIdx >= data.length - 1) {
                        merges.push({
                            s: {
                                r: map.startRowIdx,
                                c: map.colIdx
                            },
                            e: {
                                r: map.startRowIdx + map.i,
                                c: map.colIdx
                            }
                        })
                    }
                } else {
                    if (map) {
                        merges.push({
                            s: {
                                r: map.startRowIdx,
                                c: map.colIdx
                            },
                            e: {
                                r: map.startRowIdx + map.i,
                                c: map.colIdx
                            }
                        })
                    }

                    mergeMap[prop] = {
                        value: value,
                        startRowIdx: rowIdx + rowLen,
                        colIdx: colIdx,
                        i: 0
                    }


                }
            }

        })
    })


    return [dataArr, merges]

}

export function createsColWch(data: any, maxWch: number = 100, minWch: number = 1) {
    let colsWch: any = data.slice(-1)[0].map(() => { return { wch: minWch } }).concat({ wch: minWch })
    console.log(data.slice(-1)[0], 'cols', colsWch)
    data.forEach(row => {
        // console.log(row, 'row')
        row.forEach((val, colIdx) => {
            const value = val?.v || val
            if (value) {
                const len = String(value).length * 2
                const l = colsWch[colIdx].wch || 0
                // console.log(value,colsWch[colIdx], l && Math.max(l, len))
                colsWch[colIdx].wch = l && Math.max(l, len)
            }
        })
    })

    return colsWch

}

export function tableSpan_to_merges(spanArr: any, colIdx, rowStarIdx = 0) {
    let merges = []
    spanArr.forEach((row, rowIdx) => {
        if(rowIdx + 1 >= spanArr.length) return 
        if (Array.isArray(row)) {
            const findIdx = spanArr.slice(rowIdx + 1).findIndex(val => val[0])
            if (findIdx) {
                merges.push({
                    s: {
                        r: rowIdx + rowStarIdx,
                        c: colIdx
                    },
                    e: {
                        r: rowIdx + findIdx + rowStarIdx,
                        c: colIdx
                    }
                })
            }

        }
        else {
            // console.log(spanArr.slice(rowIdx + 1), 'spanArr.slice(rowIdx + 1)')
            const findIdx = spanArr.slice(rowIdx + 1).findIndex(val => val?.rowspan)
            if (findIdx) {
                merges.push({
                    s: {
                        r: rowIdx + rowStarIdx,
                        c: colIdx
                    },
                    e: {
                        r: rowIdx + findIdx + rowStarIdx,
                        c: colIdx
                    }
                })
            }


        }
    })

    return merges

}


function createHeadAoa(columns: Columns): Aoa {
    let headeAoa: Aoa = []
    let rowIdx = 0
    let colIdx = 0

    columns.forEach(value => {
        colIdx = createRow(value, rowIdx, colIdx, headeAoa)
        rowIdx = 0
        colIdx++
    })

    const maxLen = Math.max.apply(null, headeAoa.map(row => row.length))

    headeAoa.forEach(row => {
        const len = row.length
        row.splice(len, 0, ...new Array(maxLen - len))
        return row
    })


    return headeAoa
}

function createRow(col: Column, rowIdx = 0, colIdx = 0, colsArr: any = []): number {
    if (!colsArr[rowIdx]) colsArr[rowIdx] = []
    colsArr[rowIdx][colIdx] = col.label

    if (col.children) {
        rowIdx++
        col.children.forEach((_col, index) => {
            if (index > 0) colIdx++
            colIdx = createRow(_col, rowIdx, colIdx, colsArr)

        })
    }


    return colIdx
}

function createHeadMerge(headeAoa: Aoa): Array<Range> {
    let merges: Array<Range> = []

    headeAoa.forEach((row, rowIdx) => {
        row.forEach((col, colIdx) => {
            if (col) {

                // 先遍历列 添加标识
                const isLastRow = rowIdx >= headeAoa.length - 1 ? true : false
                if (!isLastRow) {
                    const nextRow = headeAoa[rowIdx + 1][colIdx]
                    if (!nextRow && !isLastRow) {
                        merges.push({
                            s: {
                                r: rowIdx,
                                c: colIdx
                            },
                            e: {
                                r: headeAoa.length - 1,
                                c: colIdx
                            }
                        })

                        for (let i = rowIdx + 1; i < headeAoa.length; i++) {
                            headeAoa[i][colIdx] = '!row'
                        }

                    }
                }

                const isLastCol = colIdx >= row.length - 1 ? true : false
                if (!isLastCol) {

                    // 不为零都需要合并
                    const nextCol = row.slice(colIdx + 1).findIndex(val => val)
                    if (nextCol !== 0) {
                        if (col === '饲料消耗情况') {
                            console.log(col, rowIdx, colIdx, nextCol + colIdx + 1)
                        }
                        if (nextCol < 0) merges.push({
                            s: {
                                r: rowIdx,
                                c: colIdx
                            },
                            e: {
                                r: rowIdx,
                                c: row.length - 1
                            }
                        })
                        else if (nextCol > 0) merges.push({
                            s: {
                                r: rowIdx,
                                c: colIdx
                            },
                            e: {
                                r: rowIdx,
                                c: nextCol + colIdx
                            }
                        })
                    }
                }

            }
        })
    })

    return merges

}

//
function floatProps(cols: Columns): Array<string | undefined> {
    let propsArr: Array<string | undefined> = []

    cols.forEach(val => {
        if (val.children) {
            propsArr = propsArr.concat(floatProps(val.children))
        }
        else propsArr.push(val.prop)

    })
    return propsArr
}




function deepRow(cols: Columns): number {
    let cur = 0
    let deep = 0
    cols.forEach(row => {
        cur = deep_(row, cur)
        if (cur > deep) deep = cur
    })
    return deep
}

function deep_(row: Column, cur: number): number {
    if (row.children) {
        cur++
        row.children.forEach(r => cur = deep_(r, cur))
    }

    return cur
}

export function writeFile(array: any, merges?: Array<Range>, colsWch?: Array<any>) {
    var ws = XLSX.utils.aoa_to_sheet(array);
    // { dense: true }
    ws['!merges'] = merges
    // ws['!cols'] = colsWch
    ws['!cols'] = createsColWch(array)
    console.log()

    var wb = XLSX.utils.book_new();
    console.log(wb, ws, ws['!cols'])
    XLSX.utils.book_append_sheet(wb, ws)

    XLSX.writeFile(wb, "SheetJS.xlsx");
}
