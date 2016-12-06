export interface IPromise<T> {
    then(success: (result:any) => any): IPromise<T>;

    catch(error: (error:any) => any): IPromise<T>;

    finally(handler: () => any): IPromise<T>;
}