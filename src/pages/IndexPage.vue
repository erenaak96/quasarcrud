<template>
  <q-page class="row items-center justify-evenly">
    <q-dialog v-model="fixed">
      <q-card>
        <q-card-section>
          <div class="text-h6" v-if="modalType === 'Update'">User Detail</div>
          <div class="text-h6" v-else>Create new User</div>
        </q-card-section>

        <q-separator />

        <q-card-section style="max-height: 50vh" class="scroll">
          <div class="row flex justify-between">
            <q-input
              class="col-grow"
              rounded
              autofocus
              dense
              outlined
              v-model="userDetail.firstName"
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
              label="Name"
            />
            <q-input
              class="col-6 q-ml-sm"
              rounded
              outlined
              dense
              v-model="userDetail.lastName"
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
              label="Surname"
            />
          </div>
          <div class="row flex justify-between q-mt-xs">
            <q-select
              rounded
              dense
              outlined
              v-model="userDetail.gender"
              :options="options"
              class="col-grow"
              label="Gender"
            />
            <q-input
              class="col-6 q-ml-sm"
              rounded
              dense
              outlined
              type="email"
              v-model="userDetail.email"
              :rules="[(val) => !!val || 'Email is missing', isValidEmail]"
              label="E-mail"
            />
          </div>
        </q-card-section>
        <q-separator />

        <q-card-actions align="right">
          <q-btn flat dense label="Close" color="primary" v-close-popup />
          <q-btn
            flat
            :label="modalType === 'Update' ? 'Update User' : 'Add User'"
            color="primary"
            type="submit"
            :disable="
              userDetail.email === undefined ||
              userDetail.firstName === undefined ||
              userDetail.lastName === undefined
            "
            @click="updateUserData()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-table
      class="row"
      title="Employees List Crud"
      :rows="rows"
      :columns="columns"
      row-key="name"
      color="info"
    >
      <template v-slot:top-right>
        <q-btn color="info" icon="add" round @click="addUserModal()" />
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <q-btn
            color="negative"
            round
            dense
            icon="delete"
            @click="deleteval(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-view="props">
        <q-td :props="props">
          <q-btn
            color="warning"
            round
            icon="edit"
            dense
            @click="getDetail(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script lang="ts" setup>
import {
  getUsers,
  deleteUser,
  getUserDetail,
  updateUser,
  addUser,
} from '../boot/axios';
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';

const columns = [
  {
    name: 'id',
    align: 'center',
    label: 'Id',
    field: 'id',
  },
  {
    name: 'title',
    align: 'left',
    label: 'Title',
    field: 'title',
  },
  {
    name: 'firstName',
    align: 'left',
    label: 'First Name',
    field: 'firstName',
  },
  {
    name: 'lastName',
    align: 'left',
    label: 'Last Name',
    field: 'lastName',
  },
  {
    name: 'picture',
    align: 'left',
    label: 'Pic URL',
    field: 'picture',
  },
  { name: 'action', label: 'Delete', field: 'action' },
  { name: 'view', label: 'Update', field: 'view' },
];
const $q = useQuasar();
let rows: any = ref([]); //TABLE ROWS
let userDetail: any = ref([]); //MODAL DATA
let modalType: any = ref(''); //MODAL ADD UPDATE STATE
let fixed: any = ref(false); //MODAL SHOW STATE
const options = ['male', 'female'];
//ON MOUNT
onMounted(() => {
  getData();
});

//METHODS
function isValidEmail(val: string) {
  //email validation
  const emailPattern =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
  return emailPattern.test(val) || 'Invalid email';
}
async function getData() {
  //Datayı çekiyoruz
  const data = await getUsers();
  rows.value = data[0].data;
  // console.log(rows);
}
async function getDetail(id: any) {
  //user detail get
  // console.log(id);
  $q.notify({
    spinner: true,
    message: 'Please wait...',
    timeout: 2000,
  });
  modalType.value = 'Update'; //tek modalda kullanmak için modala update yada add olarak state veriyoruz
  const userData: any = await getUserDetail(id);
  userDetail.value = userData[0].data;
  // console.log(userData);
  fixed.value = true;
}
function deleteval(e: any) {
  //PROPTAN ROW DATASINI ALIYORUZ ID GONDERIYORUZ
  // console.log(e.id);

  $q.dialog({
    title: 'Delete User',
    message: 'Would you like to delete this user?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteUser(e.id);
    setTimeout(() => {
      getData();
    }, 500);
  });
}
async function addNewUser(data: any) {
  await addUser(data).then((res: any) => {
    // console.log(res);
    if (res[0].status === 200) {
      $q.notify({
        message: 'User Added Succesfully',
        color: 'positive',
      });
      fixed.value = false;
      userDetail.value = []; //BAŞARILI OLURSA MODAL DATASINI BOŞALTIYORUZ
    } else {
      $q.notify({
        message: 'An error occured.(Probably given mail)', //burada apiden dönen error basılmalı
        color: 'negative',
      });
    }
  });
}
async function updateUserData() {
  const rawUserData: any = { ...userDetail.value }; //DATAYI ALIYORUZ
  // console.log(rawUserData);
  if (modalType.value === 'Update') {
    await updateUser(rawUserData.id, rawUserData).then((res: any) => {
      if (res[0].status === 200) {
        $q.notify({
          message: 'Successfully Updated',
          color: 'positive',
        });
        setTimeout(() => {
          getData();
        }, 500);
        fixed.value = false;
      } else {
        $q.notify({
          message: 'An error occured.(Probably given mail)', //burada apiden dönen error basılmalı
          color: 'negative',
        });
      }
    });
  } else {
    addNewUser(rawUserData);
  }
}
function addUserModal() {
  //MODALI BOŞALTIP TYPE DEĞİŞİYORUZ
  userDetail.value = [];
  modalType.value = 'Add';
  fixed.value = true;
}
</script>
<style lang="scss">
.q-card {
  width: 100%;
}
</style>
