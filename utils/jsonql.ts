import invert from "lodash/invert";
import cloneDeep from "lodash/cloneDeep";

export interface IJsonQLMini<T extends object> {
    registry: {
        [ key: string ]: string; 
    },
    data: T; 
}

interface IJsonQLMiniCounter {
    key: number; 
    repeat: number; 
}

export default class JsonQL {
    private counter:IJsonQLMiniCounter = { 
        key: 1,
        repeat: 0
    }

    private registry:any = {} 

    constructor() {}

    public mini<T extends object>(object: T) : IJsonQLMini<T> {
        const data = Array.isArray(object) ? 
            this.switchArray(object, this.getNextKey.bind(this)) : 
            this.switchObject(object, this.getNextKey.bind(this));

        return { data, registry: this.registry }
    }

    public hydrate<T extends object>(object:IJsonQLMini<T>) : T {
        this.registry = invert(cloneDeep(object.registry));
        const data = Array.isArray(object.data) ? 
            this.switchArray(object.data, this.injectKey.bind(this)) : 
            this.switchObject(object.data, this.injectKey.bind(this));
        
        return data; 
    }

    private injectKey(miniKey:string) {
        return this.registry[miniKey];
    };

    private switchObject<T extends object>(object: T,  getKey:Function) {
        const switchedObject = {} as any;
        getKey.apply(this);

        for (let key in object) {
            const isArray = Array.isArray(object[key]); 
            const isNull = object[key] === null;

            if (typeof object[key] === "object" && !isArray && !isNull) {
                const subobject = object[key];
                switchedObject[getKey(key)] = this.switchObject<any>(subobject, getKey);
            } else if (isArray) {
                switchedObject[getKey(key)] = this.switchArray(object[key], getKey);
            }   
            else switchedObject[getKey(key)] = object[key];
        }

        return switchedObject
    }

    private switchArray(object:any, getKey:Function) {
        getKey.apply(this);
        return object.map((item:any) => {
            if (Array.isArray(item)) return this.switchArray(object, getKey);
            else if (typeof item === "object") return this.switchObject(item, getKey);
            else return item; 
        });
    }

    private getNextKey(oldKey:string) : string {
        const nextKey = `${this.counter.repeat || ''}${this.counter.key}`;
        if (this.registry[oldKey] !== undefined) return this.registry[oldKey]
        this.registry[oldKey] = nextKey;
        if (this.counter.key > 8) {
            this.counter.key = 0; 
            this.counter.repeat += 1;
        } else this.counter.key += 1;

        return nextKey;
    }
}