import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CostumerCreatedEvent from "../costumer-created.event";

export default class EnviaConsoleLog2Handler
  implements EventHandlerInterface<CostumerCreatedEvent>
{
  handle(event: CostumerCreatedEvent): void {
    console.log(`Esse é o segundo console.log do evento: CustomerCreated`);
  }
}
