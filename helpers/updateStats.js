import mongoose from "mongoose";

const binarySearch = (arr, player) => {
    let start = 0;
    let end = arr.length - 1;

    let ans = {
        doesExist : false,
        index: -1
    }

    while (start <= end) {
        let mid = Math.floor((start + end) / 2);

        console.log(arr[mid].player.toString(), ', ', player.toString())
        console.log(typeof arr[mid].player.toString(), ', ', typeof player.toString())
        if (arr[mid].player.toString() == player.toString()) {

            ans = {
                doesExist: true,
                index: mid
            }
            return ans;
        } else if (arr[mid].player < player) {
            start = mid + 1;
        } else {
            end = mid - 1;
        }
    }
    ans.index = start;
    return ans;
}
export const increaseStat = (arr, player) => {
    const ans = binarySearch(arr, player)
    if(!ans.doesExist)
    arr.splice(ans.index, 0, {player: player, count: 1})

    else    arr[ans.index].count++;

    return arr
}   