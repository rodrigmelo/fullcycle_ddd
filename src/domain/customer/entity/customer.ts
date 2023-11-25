import EventDispatcher from "../../@shared/event/event-dispatcher";
import ChangeAddressEvent from "../event/change-address.event";
import CostumerCreatedEvent from "../event/costumer-created.event";
import EnviaConsoleLog1Handler from "../event/handler/envia-console.log-1-handler";
import EnviaConsoleLog2Handler from "../event/handler/envia-console.log-2-handler";
import ChangeAddressHandler from "../event/handler/envia-console.log-handler";
import Address from "../value-object/address";

export default class Customer {
  private _id: string;
  private _name: string = "";
  private _address!: Address;
  private _active: boolean = false;
  private _rewardPoints: number = 0;
  private _eventDispatcher: EventDispatcher;

  constructor(id: string, name: string, eventDispatcher?: EventDispatcher) {
    this._id = id;
    this._name = name;
    this._eventDispatcher = eventDispatcher;
    this.validate();
    this.notifyWhenCostumerCreated();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get rewardPoints(): number {
    return this._rewardPoints;
  }

  validate() {
    if (this._id.length === 0) {
      throw new Error("Id is required");
    }
    if (this._name.length === 0) {
      throw new Error("Name is required");
    }
  }

  changeName(name: string) {
    this._name = name;
    this.validate();
  }

  get Address(): Address {
    return this._address;
  }

  changeAddress(address: Address) {
    this._address = address;
    this.notifyWhenChangeAddress();
  }

  isActive(): boolean {
    return this._active;
  }

  activate() {
    if (this._address === undefined) {
      throw new Error("Address is mandatory to activate a customer");
    }
    this._active = true;
  }

  deactivate() {
    this._active = false;
  }

  addRewardPoints(points: number) {
    this._rewardPoints += points;
  }

  set Address(address: Address) {
    this._address = address;
  }

  get eventDispatcher() {
    return this._eventDispatcher;
  }

  notifyWhenCostumerCreated() {
    if (!this._eventDispatcher) return;

    const eventHandler1 = new EnviaConsoleLog1Handler();
    const eventHandler2 = new EnviaConsoleLog2Handler();
    const createdCostumerEvent = new CostumerCreatedEvent();

    this._eventDispatcher.register("CostumerCreatedEvent", eventHandler1);
    this._eventDispatcher.register("CostumerCreatedEvent", eventHandler2);

    this._eventDispatcher.notify(createdCostumerEvent);
    this._eventDispatcher.notify(createdCostumerEvent);
  }

  notifyWhenChangeAddress() {
    if (!this._eventDispatcher) return;

    const eventHandler = new ChangeAddressHandler();
    const changeAddressEvent = new ChangeAddressEvent({
      id: this._id,
      name: this._name,
      address: this._address,
    });

    this._eventDispatcher.register("ChangeAddressEvent", eventHandler);

    this._eventDispatcher.notify(changeAddressEvent);
  }
}
