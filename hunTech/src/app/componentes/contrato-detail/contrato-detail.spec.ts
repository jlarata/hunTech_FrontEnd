import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratoDetail } from './contrato-detail';

describe('ContratoDetail', () => {
  let component: ContratoDetail;
  let fixture: ComponentFixture<ContratoDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratoDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratoDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});