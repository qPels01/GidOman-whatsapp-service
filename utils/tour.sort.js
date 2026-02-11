export class TourSorter {
    constructor(toursList) {
        this.toursList = toursList;
        this.keys = Object.keys(toursList).map(key => ({
            key,
            nk: this.normalize(key),
            len: this.normalize(key).length,
        }));
        
        this.keys.sort((a, b) => b.len - a.len);
    }

    normalize(s = "") {
        return s.toLowerCase().replace(/\s+/g, " ").trim();
    }

    bestMatchKey(tourName) {
        const name = this.normalize(tourName);
        const found = this.keys.find(k => name.includes(k.nk));
        return found ? found.key : null;
    }
}
